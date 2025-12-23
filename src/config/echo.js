import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config';

// Initialize Pusher
window.Pusher = Pusher;

// Configure Laravel Echo with Reverb
const echo = new Echo({
    broadcaster: 'reverb',
    key: config.REVERB_APP_KEY || 'YOUR_REVERB_APP_KEY',
    wsHost: config.REVERB_HOST || 'localhost',
    wsPort: config.REVERB_PORT || 8080,
    wssPort: config.REVERB_PORT || 8080,
    forceTLS: config.ENV === 'production',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${config.API_URL}/broadcasting/auth`,
    authorizer: (channel) => {
        return {
            authorize: async (socketId, callback) => {
                try {
                    const token =
                        (await AsyncStorage.getItem('authToken')) ||
                        (await AsyncStorage.getItem('token')) ||
                        (await AsyncStorage.getItem('access_token'));

                    const response = await fetch(`${config.API_URL}/broadcasting/auth`, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({
                            socket_id: socketId,
                            channel_name: channel.name,
                        }),
                    });

                    const text = await response.text();
                    let data;
                    try {
                        data = JSON.parse(text);
                    } catch (err) {
                        return callback(true, {
                            error: `Auth parse error (${response.status}): ${text}`,
                            status: response.status,
                        });
                    }

                    if (!response.ok) {
                        return callback(true, {
                            error: `Auth failed (${response.status}): ${text}`,
                            status: response.status,
                        });
                    }

                    return callback(false, data);
                } catch (error) {
                    return callback(true, error);
                }
            },
        };
    },
    auth: {
        headers: {
            Authorization: null, // Will be set dynamically
            Accept: 'application/json',
        },
    },
});

export const setEchoAuthToken = (token) => {
    if (echo.connector.pusher.config.auth) {
        echo.connector.pusher.config.auth.headers.Authorization = `Bearer ${token}`;
    }
};

export const disconnectEcho = () => {
    echo.disconnect();
};

export default echo;
