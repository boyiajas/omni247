/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { LocationProvider, LocationContext } from '../src/contexts/LocationContext';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

// Mock dependencies
jest.mock('react-native-geolocation-service', () => ({
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
    PERMISSIONS: {
        IOS: {
            LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
        },
        ANDROID: {
            ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
        },
    },
    RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
        BLOCKED: 'blocked',
    },
    check: jest.fn(),
    request: jest.fn(),
}));

// Mock console methods to keep test output clean
const originalConsoleLog = console.log;
beforeAll(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
});

afterAll(() => {
    console.log = originalConsoleLog;
});

describe('LocationContext', () => {
    let mockGeolocationSuccess;
    let mockGeolocationError;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock successful geolocation
        mockGeolocationSuccess = {
            coords: {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            },
            timestamp: Date.now(),
        };

        mockGeolocationError = {
            code: 1,
            message: 'Location permission denied',
        };

        // Default mock for Android permissions
        Platform.OS = 'android';
        PermissionsAndroid.check = jest.fn().mockResolvedValue(true);
        PermissionsAndroid.request = jest.fn().mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);

        // Mock successful geolocation by default
        Geolocation.getCurrentPosition.mockImplementation((success, error, options) => {
            setTimeout(() => success(mockGeolocationSuccess), 0);
        });
    });

    test('LocationProvider renders without crashing', async () => {
        let component;
        await ReactTestRenderer.act(async () => {
            component = ReactTestRenderer.create(
                <LocationProvider>
                    <></>
                </LocationProvider>
            );
        });

        expect(component).toBeDefined();
    });

    test('LocationProvider provides context value', async () => {
        let contextValue;

        const TestComponent = () => {
            contextValue = React.useContext(LocationContext);
            return null;
        };

        let component;
        await ReactTestRenderer.act(async () => {
            component = ReactTestRenderer.create(
                <LocationProvider>
                    <TestComponent />
                </LocationProvider>
            );
        });

        expect(contextValue).toBeDefined();
        expect(contextValue.getCurrentLocation).toBeDefined();
        expect(typeof contextValue.getCurrentLocation).toBe('function');
    });

    test('LocationProvider handles successful location fetch', async () => {
        let contextValue;

        const TestComponent = () => {
            contextValue = React.useContext(LocationContext);
            return null;
        };

        await ReactTestRenderer.act(async () => {
            ReactTestRenderer.create(
                <LocationProvider>
                    <TestComponent />
                </LocationProvider>
            );

            // Wait for async initialization
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(Geolocation.getCurrentPosition).toHaveBeenCalled();
    });

    test('LocationProvider handles location error gracefully without crashing', async () => {
        // Mock location fetch error
        Geolocation.getCurrentPosition.mockImplementation((success, error, options) => {
            setTimeout(() => error(mockGeolocationError), 0);
        });

        let contextValue;

        const TestComponent = () => {
            contextValue = React.useContext(LocationContext);
            return null;
        };

        await ReactTestRenderer.act(async () => {
            ReactTestRenderer.create(
                <LocationProvider>
                    <TestComponent />
                </LocationProvider>
            );

            // Wait for async initialization
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        // App should not crash and context should be defined
        expect(contextValue).toBeDefined();
        expect(contextValue.getCurrentLocation).toBeDefined();
    });

    test('LocationProvider handles permission denial gracefully', async () => {
        // Mock permission denial
        PermissionsAndroid.check = jest.fn().mockResolvedValue(false);
        PermissionsAndroid.request = jest.fn().mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

        let contextValue;

        const TestComponent = () => {
            contextValue = React.useContext(LocationContext);
            return null;
        };

        await ReactTestRenderer.act(async () => {
            ReactTestRenderer.create(
                <LocationProvider>
                    <TestComponent />
                </LocationProvider>
            );

            // Wait for async initialization
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        // Should not crash when permission is denied
        expect(contextValue).toBeDefined();
    });

    test('getCurrentLocation can be called manually', async () => {
        let contextValue;

        const TestComponent = () => {
            contextValue = React.useContext(LocationContext);
            return null;
        };

        await ReactTestRenderer.act(async () => {
            ReactTestRenderer.create(
                <LocationProvider>
                    <TestComponent />
                </LocationProvider>
            );

            // Wait for initialization
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        // Manually call getCurrentLocation
        let result;
        await ReactTestRenderer.act(async () => {
            result = await contextValue.getCurrentLocation();
        });

        expect(result).toBeDefined();
        expect(result.latitude).toBe(mockGeolocationSuccess.coords.latitude);
        expect(result.longitude).toBe(mockGeolocationSuccess.coords.longitude);
    });
});
