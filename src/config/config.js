const ENV = process.env.NODE_ENV || 'development';

const environments = {
    development: {
        API_URL: process.env.API_URL || 'http://10.0.2.2:8000/api',
        WS_URL: process.env.WS_URL || 'ws://10.0.2.2:8000',
        REVERB_APP_KEY: process.env.REVERB_APP_KEY || 'local',
        REVERB_HOST: process.env.REVERB_HOST || '10.0.2.2',
        REVERB_PORT: process.env.REVERB_PORT || '8080',
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        ENV: 'development',
    },
    staging: {
        API_URL: process.env.API_URL || 'https://staging-api.gireport.com/api',
        WS_URL: process.env.WS_URL || 'wss://staging-api.gireport.com',
        REVERB_APP_KEY: process.env.REVERB_APP_KEY,
        REVERB_HOST: process.env.REVERB_HOST || 'staging-api.gireport.com',
        REVERB_PORT: process.env.REVERB_PORT || '443',
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        ENV: 'staging',
    },
    production: {
        API_URL: process.env.API_URL || 'https://api.gireport.com/api',
        WS_URL: process.env.WS_URL || 'wss://api.gireport.com',
        REVERB_APP_KEY: process.env.REVERB_APP_KEY,
        REVERB_HOST: process.env.REVERB_HOST || 'api.gireport.com',
        REVERB_PORT: process.env.REVERB_PORT || '443',
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        ENV: 'production',
    },
};

export default environments[ENV];
