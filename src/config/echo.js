import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
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
