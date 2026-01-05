// Geocoding service for converting coordinates to addresses and vice versa
// Note: Reverse geocoding is proxied through the backend to keep API keys off the client.
import ApiClient from '../api/ApiClient';

class GeocodingService {
    async reverseGeocode(latitude, longitude) {
        try {
            const response = await ApiClient.get('/geocode/reverse', {
                params: {
                    lat: latitude,
                    lng: longitude,
                },
            });

            return response.data || {
                address: null,
                city: null,
                state: null,
                country: null,
                postalCode: null,
                formattedAddress: null,
            };
        } catch (error) {
            if (__DEV__) {
                console.warn('Reverse geocoding failed:', error?.response?.status || error?.message || error);
            }
            return {
                address: null,
                city: null,
                state: null,
                country: null,
                postalCode: null,
                formattedAddress: null,
            };
        }
    }

    async geocode(address) {
        try {
            if (!address) {
                return {
                    latitude: null,
                    longitude: null,
                    address: null,
                    city: null,
                    state: null,
                    country: null,
                    postalCode: null,
                    formattedAddress: null,
                };
            }

            const response = await ApiClient.get('/geocode', {
                params: { address },
            });

            return response.data || {
                latitude: null,
                longitude: null,
                address: null,
                city: null,
                state: null,
                country: null,
                postalCode: null,
                formattedAddress: null,
            };
        } catch (error) {
            console.error('Geocoding error:', error);
            return {
                latitude: null,
                longitude: null,
                address: null,
                city: null,
                state: null,
                country: null,
                postalCode: null,
                formattedAddress: null,
            };
        }
    }

    formatAddress(addressComponents) {
        const { address, city, state, postalCode, country } = addressComponents;

        const parts = [address, city, state, postalCode, country].filter(Boolean);
        return parts.join(', ');
    }
}

export default new GeocodingService();
