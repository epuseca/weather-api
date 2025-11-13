require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    weather: {
        apiKey: process.env.WEATHER_API_KEY,
        baseUrl: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline'
    },

    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_HOST) || 6379
    },

    cache: {
        expiration: parseInt(process.env.CACHE_EXPIRATION) || 43200 //12 hours
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100
    }
};

const validateConfig = () => {
    if (!config.weather.apiKey) {
        throw new Error('WEATHER_API_KEY is required in .env file');
    }
}
validateConfig()
module.exports = config;