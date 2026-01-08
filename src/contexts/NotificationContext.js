import React, { createContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import echo, { setEchoAuthToken } from '../config/echo';
import { notificationsAPI } from '../services/api/notifications';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext();

let connectionDebugBound = false;

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [realtimeStatus, setRealtimeStatus] = useState('disconnected');
    const [realtimeError, setRealtimeError] = useState(null);
    const notificationsInFlight = useRef(false);
    const unreadInFlight = useRef(false);
    const lastNotificationsFetchAt = useRef(0);
    const lastUnreadFetchAt = useRef(0);
    const { user, token } = useAuth();

    useEffect(() => {
        if (token) {
            ensureDeviceRegistered();
            initializeEcho();
            loadNotifications();
        }

        return () => {
            // Cleanup Echo listeners
            if (user?.id) {
                echo.leave(`user.${user.id}`);
                echo.leave('incidents');
            }
        };
    }, [token, user?.id]);

    const ensureDeviceRegistered = async () => {
        try {
            if (!token) return;
            let deviceUuid = await AsyncStorage.getItem('device_uuid');
            if (!deviceUuid) {
                deviceUuid = `device-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
                await AsyncStorage.setItem('device_uuid', deviceUuid);
            }

            await notificationsAPI.registerDevice({
                device_uuid: deviceUuid,
                device_type: Platform.OS,
                device_name: Platform.OS === 'android' ? 'Android' : 'iOS',
                os_version: String(Platform.Version || ''),
            });
        } catch (error) {
            console.error('Device registration error:', error);
        }
    };

    const initializeEcho = () => {
        if (!token || !user) return;

        // Set authentication token
        setEchoAuthToken(token);

        const formatRealtimeError = (err) => {
            if (!err) return 'Unknown realtime error.';
            return (
                err?.error?.data?.message
                || err?.error?.message
                || err?.message
                || String(err)
            );
        };

        if (!connectionDebugBound && echo.connector?.pusher?.connection) {
            connectionDebugBound = true;
            const connection = echo.connector.pusher.connection;
            connection.bind('connecting', () => {
                setRealtimeStatus('connecting');
                setRealtimeError(null);
            });
            connection.bind('connected', () => {
                setRealtimeStatus('connected');
                setRealtimeError(null);
            });
            connection.bind('disconnected', () => {
                setRealtimeStatus('disconnected');
            });
            connection.bind('error', (err) => {
                setRealtimeStatus('error');
                setRealtimeError(formatRealtimeError(err));
            });
        }

        // Listen to user's private channel
        const userChannel = echo
            .private(`user.${user.id}`)
            .notification((notification) => {
                addNotification(notification);
            })
            .listen('.NotificationCreated', (event) => {
                if (event?.notification) {
                    addNotification(event.notification);
                    refreshUnreadCount();
                }
            });
        userChannel.subscribed(() => {
            setRealtimeStatus('subscribed');
            setRealtimeError(null);
        });
        userChannel.error((err) => {
            setRealtimeStatus('auth_error');
            setRealtimeError(formatRealtimeError(err));
        });

        // Listen to public incidents channel
        echo.channel('incidents').listen('IncidentReported', (event) => {
            handleNewIncident(event);
        });

        // Listen to nearby incidents based on user location
        if (user.latitude && user.longitude) {
            const gridX = Math.floor(user.latitude * 100);
            const gridY = Math.floor(user.longitude * 100);
            echo.channel(`location.${gridX}.${gridY}`).listen('NearbyIncident', (event) => {
                handleNearbyIncident(event);
            });
        }
    };

    const refreshUnreadCount = async () => {
        try {
            const now = Date.now();
            if (unreadInFlight.current || now - lastUnreadFetchAt.current < 1000) {
                return;
            }
            unreadInFlight.current = true;
            const unreadResponse = await notificationsAPI.getUnreadCount();
            setUnreadCount(unreadResponse.data.unread_count || 0);
        } catch (error) {
            console.error('Error loading unread count:', error);
        } finally {
            lastUnreadFetchAt.current = Date.now();
            unreadInFlight.current = false;
        }
    };

    const loadNotifications = async () => {
        try {
            const now = Date.now();
            if (notificationsInFlight.current || now - lastNotificationsFetchAt.current < 1500) {
                return;
            }
            notificationsInFlight.current = true;
            const response = await notificationsAPI.getNotifications();
            setNotifications(response.data.notifications || response.data.data || []);
            await refreshUnreadCount();
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            lastNotificationsFetchAt.current = Date.now();
            notificationsInFlight.current = false;
        }
    };

    const addNotification = (notification) => {
        setNotifications((prev) => {
            const exists = notification?.id && prev.some((item) => item.id === notification.id);
            if (!exists) {
                setUnreadCount((prevCount) => prevCount + 1);
                return [notification, ...prev];
            }
            return prev;
        });
    };

    const handleNewIncident = (event) => {
        // Handle new incident broadcast
        const notification = {
            id: Date.now().toString(),
            type: 'incident',
            title: 'New Incident Reported',
            body: event.incident?.title || 'A new incident has been reported',
            data: event.incident,
            created_at: new Date().toISOString(),
            read: false,
        };
        addNotification(notification);
    };

    const handleNearbyIncident = (event) => {
        // Handle nearby incident
        const notification = {
            id: Date.now().toString(),
            type: 'nearby_incident',
            title: 'Nearby Incident Alert',
            body: `${event.incident?.category}: ${event.incident?.title}`,
            data: event.incident,
            created_at: new Date().toISOString(),
            read: false,
        };
        addNotification(notification);
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationsAPI.markAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const subscribeToChannel = (channelName, eventName, callback) => {
        echo.channel(channelName).listen(eventName, callback);
    };

    const unsubscribeFromChannel = (channelName) => {
        echo.leave(channelName);
    };

    const value = {
        notifications,
        unreadCount,
        realtimeStatus,
        realtimeError,
        loadNotifications,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
        subscribeToChannel,
        unsubscribeFromChannel,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
