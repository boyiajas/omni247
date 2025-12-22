import React, { createContext, useState, useEffect } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);
    const [watchId, setWatchId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Temporarily disabled to prevent Google Play Services crash
        // TODO: Fix Google Play Services location provider conflict
        // initializeLocation();

        console.log('LocationContext initialized - location tracking disabled temporarily');
        setLoading(false);
    }, []);

    const checkLocationPermission = async () => {
        try {
            let granted = false;

            if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                granted = result;
            } else {
                const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                granted = result === RESULTS.GRANTED;
            }

            setHasPermission(granted);

            if (granted) {
                getCurrentLocation();
            }
        } catch (error) {
            console.error('Error checking location permission:', error);
            setError(error.message);
        }
    };

    const requestLocationPermission = async () => {
        try {
            let granted = false;

            if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                granted = result === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                granted = result === RESULTS.GRANTED;
            }

            setHasPermission(granted);

            if (granted) {
                getCurrentLocation();
            }

            return granted;
        } catch (error) {
            console.error('Error requesting location permission:', error);
            setError(error.message);
            return false;
        }
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp,
                    };
                    setLocation(locationData);
                    setError(null);
                    resolve(locationData);
                },
                (err) => {
                    setError(err.message);
                    reject(err);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                }
            );
        });
    };

    const startTracking = () => {
        if (!hasPermission) {
            requestLocationPermission();
            return;
        }

        const id = Geolocation.watchPosition(
            (position) => {
                const locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                };
                setLocation(locationData);
                setError(null);
            },
            (err) => {
                setError(err.message);
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 10,
                interval: 5000,
                fastestInterval: 2000,
            }
        );

        setWatchId(id);
        setIsTracking(true);
    };

    const stopTracking = () => {
        if (watchId !== null) {
            Geolocation.clearWatch(watchId);
            setWatchId(null);
            setIsTracking(false);
        }
    };

    const value = {
        location,
        isTracking,
        hasPermission,
        error,
        getCurrentLocation,
        requestLocationPermission,
        startTracking,
        stopTracking,
    };

    return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
