const { getRedisClient } = require('../config/redis')
const config = require('../config/env')

const PREFIX = 'weather:';

const generateKey = (city, unitGroup = 'metric') => {
    return `${PREFIX}${city.toLowerCase()}:${unitGroup}`;
}

const get = async (city, unitGroup = 'metric') => {
    try {
        const client = getRedisClient();
        const key = generateKey(city, unitGroup)
        const cacheData = await client.get(key)

        if (cacheData) {
            console.log(`Cache HIT cho: ${city} (${unitGroup})`);
            return JSON.parse(cacheData);
        }
        console.log(`Cache MISS cho: ${city} (${unitGroup})`);
        return null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

const set = async (city, data, unitGroup = 'metric') => {
    try {
        const client = getRedisClient()
        const key = generateKey(city, unitGroup)
        const expiration = config.cache.expiration;

        await client.setEx(key, expiration, JSON.stringify(data))
        console.log(`Đã lưu cache cho: ${city} (${unitGroup}) - TTL: ${expiration}s`);
        return true;
    } catch (error) {
        console.error('Cache set error:', error);
        return false;
    }
}

const deleteCache = async (city, unitGroup = 'metric') => {
    try {
        const client = getRedisClient()
        const key = generateKey(city, unitGroup)

        const result = await client.del(key)

        if (result === 1) {
            console.log(`Đã xóa cache cho: ${city} (${unitGroup})`);
            return true;
        }
        console.log(`Không tìm thấy cache cho: ${city} (${unitGroup})`);
        return false;
    } catch (error) {
        console.error('Cache delete error:', error);
        return false;
    }
}

const clear = async () => {
    try {
        const client = getRedisClient();
        const keys = await client.keys(`${PREFIX}*`);
        if (keys.length > 0) {
            await client.del(keys)
            console.log(`Đã xóa ${keys.length} cache entries`);
            return keys.length;
        }
        console.log('Không có cache nào để xóa');
        return 0;
    } catch (error) {
        console.error('Cache clear error:', error);
        return 0;
    }
}

const getTTL = async (city, unitGroup = 'metric') => {
    try {
        const client = getRedisClient()
        const key = generateKey(city, unitGroup)

        const ttl = await client.ttl(key)
        return ttl;
    } catch (error) {
        console.log('Cache TTL error', error)
        return -1;
    }
}
module.exports = {
    get,
    set,
    delete: deleteCache,
    clear,
    getTTL
};