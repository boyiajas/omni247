const ENV = process.env.NODE_ENV || 'development';

const environments = {
    development: {
        API_URL: process.env.API_URL || 'https://api.omni-247.com/api',
        WS_URL: process.env.WS_URL || 'wss://ws.omni-247.com',
        REVERB_APP_KEY: process.env.REVERB_APP_KEY || 'local',
        REVERB_HOST: process.env.REVERB_HOST || 'ws.omni-247.com',
        REVERB_PORT: process.env.REVERB_PORT || '443',
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        ENV: 'development',
    },
    staging: {
        API_URL: process.env.API_URL || 'https://api.omni-247.com/api',
        WS_URL: process.env.WS_URL || 'wss://ws.omni-247.com',
        REVERB_APP_KEY: process.env.REVERB_APP_KEY || 'local',
        REVERB_HOST: process.env.REVERB_HOST || 'ws.omni-247.com',
        REVERB_PORT: process.env.REVERB_PORT || '443',
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        ENV: 'staging',
    },
    production: {
        API_URL: process.env.API_URL || 'https://api.omni-247.com/api',
        WS_URL: process.env.WS_URL || 'wss://ws.omni-247.com',
        REVERB_APP_KEY: process.env.REVERB_APP_KEY || 'local',
        REVERB_HOST: process.env.REVERB_HOST || 'ws.omni-247.com',
        REVERB_PORT: process.env.REVERB_PORT || '443',
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        ENV: 'production',
    },
};

export default environments[ENV];
