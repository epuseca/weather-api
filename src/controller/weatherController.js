const weatherService = require('../services/weatherService')
const cacheService = require('../services/cacheService')

const getWeather = async (req, res, next) => {
    try {
        const { city } = req.params;
        const unitGroup = req.query.unit || 'metric'

        if (!city || !city.trim().length === 0) {
            return res.status(400).json({
                succces: false,
                error: 'The city name is not empty'
            })
        }
        if (!['metric', 'us', 'uk'].includes(unitGroup)) {
            return res.status(400).json({
                success: false,
                error: 'Unit phải là: metric, us, hoặc uk'
            });
        }
        const cachedData = await cacheService.get(city, unitGroup)
        if (cachedData) {
            const ttl = await cacheService.getTTL(city, unitGroup)
            return res.json({
                success: true,
                source: 'cache',
                ttl: ttl > 0 ? ttl : 0,
                data: cachedData
            });
        }
        const weatherData = await weatherService.fetchWeatherData(city, unitGroup)

        await cacheService.set(city, weatherData, unitGroup)
        res.json({
            success: true,
            source: 'api',
            data: weatherData
        });
    } catch (error) {
        next(error);
    }
}

const clearCityCache = async (req, res, next) => {
    try {
        const { city } = req.params;
        const unitGroup = req.query.unit || 'metric'

        if (!city || !city.trim().length === 0) {
            return res.status(400).json({
                succces: false,
                error: 'The city name is not empty'
            })
        }
        const deleted = await cacheService.delete(city, unitGroup)
        res.json({
            success: true,
            message: deleted
                ? `Đã xóa cache cho: ${city} (${unitGroup})`
                : `Không tìm thấy cache cho: ${city} (${unitGroup})`
        });
    } catch (error) {
        next(error);
    }
}

const clearAllCache = async (req, res, next) => {
    try {
        const count = await cacheService.clear();

        res.json({
            success: true,
            message: `Đã xóa ${count} cache entries`
        });

    } catch (error) {
        next(error);
    }
};

const healthCheck = (req, res) => {
    res.json({
        success: true,
        message: 'Weather API is running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            getWeather: {
                method: 'GET',
                path: '/api/weather/:city',
                params: { city: 'string' },
                query: { unit: 'metric | us | uk (optional)' },
                example: '/api/weather/hanoi?unit=metric'
            },
            clearCityCache: {
                method: 'DELETE',
                path: '/api/cache/:city',
                params: { city: 'string' },
                query: { unit: 'metric | us | uk (optional)' },
                example: '/api/cache/hanoi?unit=metric'
            },
            clearAllCache: {
                method: 'DELETE',
                path: '/api/cache',
                example: '/api/cache'
            }
        }
    });
};

module.exports = {
    getWeather,
    clearCityCache,
    clearAllCache,
    healthCheck
};