import Geolocation from 'react-native-geolocation-service';

class LocationService {
    getCurrentPosition(options = {}) {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp,
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                    ...options,
                }
            );
        });
    }

    watchPosition(callback, errorCallback, options = {}) {
        return Geolocation.watchPosition(
            (position) => {
                callback({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                });
            },
            errorCallback,
            {
                enableHighAccuracy: true,
                distanceFilter: 10,
                interval: 5000,
                fastestInterval: 2000,
                ...options,
            }
        );
    }

    clearWatch(watchId) {
        Geolocation.clearWatch(watchId);
    }

    stopObserving() {
        Geolocation.stopObserving();
    }
}

export default new LocationService();
