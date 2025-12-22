import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import echo, { setEchoAuthToken } from '../config/echo';
import { notificationsAPI } from '../services/api/notifications';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, token } = useAuth();

    useEffect(() => {
        if (token) {
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
    }, [token, user]);

    const initializeEcho = () => {
        if (!token || !user) return;

        // Set authentication token
        setEchoAuthToken(token);

        // Listen to user's private channel
        echo
            .private(`user.${user.id}`)
            .notification((notification) => {
                console.log('New notification received:', notification);
                addNotification(notification);
            });

        // Listen to public incidents channel
        echo.channel('incidents').listen('IncidentReported', (event) => {
            console.log('New incident reported:', event);
            handleNewIncident(event);
        });

        // Listen to nearby incidents based on user location
        if (user.latitude && user.longitude) {
            const gridX = Math.floor(user.latitude * 100);
            const gridY = Math.floor(user.longitude * 100);
            echo.channel(`location.${gridX}.${gridY}`).listen('NearbyIncident', (event) => {
                console.log('Nearby incident:', event);
                handleNearbyIncident(event);
            });
        }
    };

    const loadNotifications = async () => {
        try {
            const response = await notificationsAPI.getNotifications();
            const unreadResponse = await notificationsAPI.getUnreadCount();
            setNotifications(response.data.notifications || response.data.data || []);
            setUnreadCount(unreadResponse.data.unread_count || 0);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const addNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
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
        loadNotifications,
        markAsRead,
        markAllAsRead,
        subscribeToChannel,
        unsubscribeFromChannel,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
