const express = require('express');
const router = express.Router();
const weatherController = require('../controller/weatherController');
const { apiLimiter, cacheOperationsLimiter } = require('../middlewares/rateLimiter');
const { asyncHandler } = require('../middlewares/errorHandler');

// Apply rate limiter cho tất cả routes
router.use(apiLimiter);

router.get('/weather/:city',
    asyncHandler(weatherController.getWeather));

router.delete('/cache/:city', cacheOperationsLimiter,
    asyncHandler(weatherController.clearCityCache));

router.delete('/cache', cacheOperationsLimiter,
    asyncHandler(weatherController.clearAllCache));

module.exports = router;