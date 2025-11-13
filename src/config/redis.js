const redis = require('redis');
const config = require('./env');

let redisClient = null;

const createRedisClient = async () => {
    if (redisClient) {
        return redisClient
    };
    redisClient = redis.createClient({
        socket: {
            host: config.redis.host,
            port: config.redis.port
        }
    })

    redisClient.on('error', (err) => {
        console.log('Redis Client Error', err)
    })

    redisClient.on('connect', () => {
        console.log('Connent to Redis')
    })

    redisClient.on('ready', () => {
        console.log('Redis Client is ready')
    })

    redisClient.on('end', () => {
        console.log('Redis Client is closed')
    })

    await redisClient.connect();

    return redisClient;
}

const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call createRedisClient() first.');
    }
    return redisClient;
}

const closeRedisConnection = async () => {
    if (redisClient) {
        await redisClient.quit()
        redisClient = null;
        console.log('Redis connection closed gracefully')
    }
}

module.exports = {
    createRedisClient,
    getRedisClient,
    closeRedisConnection
}