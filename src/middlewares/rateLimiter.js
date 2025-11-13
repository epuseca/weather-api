const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Rate limiter cho API endpoints
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        error: 'Quá nhiều requests từ IP này',
        message: `Vui lòng thử lại sau ${config.rateLimit.windowMs / 60000} phút`,
        retryAfter: config.rateLimit.windowMs / 1000
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // Skip successful requests to the rate limiter (optional)
    skipSuccessfulRequests: false,
    // Skip failed requests to the rate limiter (optional)
    skipFailedRequests: false
});

// Rate limiter nghiêm ngặt hơn cho cache operations
const cacheOperationsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 10, // Tối đa 10 requests/phút
    message: {
        success: false,
        error: 'Quá nhiều thao tác xóa cache',
        message: 'Vui lòng thử lại sau 1 phút'
    }
});

module.exports = {
    apiLimiter,
    cacheOperationsLimiter
};