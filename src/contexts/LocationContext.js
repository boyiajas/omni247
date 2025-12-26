import React, { createContext, useState, useEffect, useRef } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const LOCATION_ENABLED = true;
    const DEBUG_LOCATION = true;
    const logLocation = (...args) => {
        if (DEBUG_LOCATION) {
            console.log('[Location]', ...args);
        }
    };
    const [location, setLocation] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);
    const watchIdRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const initializeLocation = async () => {
            setLoading(true);
            try {
                const granted = await checkLocationPermission();
                logLocation('checkPermission', granted);
                if (!granted) {
                    const requested = await requestLocationPermission();
                    logLocation('requestPermission', requested);
                    if (!requested) {
                        if (isMounted) {
                            setLoading(false);
                        }
                        return;
                    }
                }
                // Try to get current location, but don't crash if it fails
                try {
                    await getCurrentLocation();
                } catch (locationError) {
                    // Log but don't crash - location may be unavailable
                    logLocation('getCurrentLocationError', locationError?.message || locationError);
                    if (isMounted) {
                        setError(locationError?.message || 'Location is currently unavailable.');
                    }
                }
            } catch (error) {
                logLocation('initializeError', error?.message || error);
                if (isMounted) {
                    setError(error.message || 'Unable to access location.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeLocation();

        return () => {
            isMounted = false;
            if (watchIdRef.current !== null) {
                Geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const checkLocationPermission = async () => {
        try {
            let granted = false;

            if (Platform.OS === 'android') {
                const fineGranted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                const coarseGranted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
                );
                granted = fineGranted || coarseGranted;
            } else {
                const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                granted = result === RESULTS.GRANTED;
            }

            setHasPermission(granted);
            logLocation('checkPermissionResult', granted);
            return granted;
        } catch (error) {
            setHasPermission(false);
            setError(error.message || 'Unable to check location permission.');
            logLocation('checkPermissionError', error?.message || error);
            return false;
        }
    };

    const requestLocationPermission = async () => {
        try {
            let granted = false;
            let blocked = false;

            if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                ]);
                const fineResult = result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
                const coarseResult = result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];
                granted =
                    fineResult === PermissionsAndroid.RESULTS.GRANTED
                    || coarseResult === PermissionsAndroid.RESULTS.GRANTED;
                blocked =
                    !granted
                    && (fineResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
                        || coarseResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);
            } else {
                const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                granted = result === RESULTS.GRANTED;
                blocked = result === RESULTS.BLOCKED;
            }

            setHasPermission(granted);

            if (!granted) {
                setError(
                    blocked
                        ? 'Location permission is blocked. Enable it in settings.'
                        : 'Location permission denied.'
                );
            }

            logLocation('requestPermissionResult', { granted, blocked });
            return granted;
        } catch (error) {
            setHasPermission(false);
            setError(error.message || 'Unable to request location permission.');
            logLocation('requestPermissionError', error?.message || error);
            return false;
        }
    };

    const getCurrentLocation = () => {
        if (!LOCATION_ENABLED) {
            logLocation('getCurrentLocationDisabled');
            // Return resolved promise with null to avoid crashes
            return Promise.resolve(null);
        }
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
                    logLocation('currentPosition', locationData);
                    resolve(locationData);
                },
                (err) => {
                    setError(err.message);
                    logLocation('currentPositionError', err?.message || err);
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

    const startTracking = async () => {
        let granted = hasPermission;
        if (!granted) {
            granted = await requestLocationPermission();
        }
        if (!granted || watchIdRef.current !== null) {
            logLocation('startTrackingSkipped', { granted, hasWatch: watchIdRef.current !== null });
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
                logLocation('watchPosition', locationData);
            },
            (err) => {
                setError(err.message);
                logLocation('watchPositionError', err?.message || err);
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 10,
                interval: 5000,
                fastestInterval: 2000,
            }
        );

        watchIdRef.current = id;
        setIsTracking(true);
    };

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            Geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
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
