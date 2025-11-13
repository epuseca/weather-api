const config = require('../config/env');

// Middleware xử lý 404 - Route không tồn tại
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route không tồn tại',
        message: `Không tìm thấy ${req.method} ${req.originalUrl}`,
        availableEndpoints: [
            'GET /',
            'GET /api/weather/:city',
            'DELETE /api/cache/:city',
            'DELETE /api/cache'
        ]
    });
};

// Middleware xử lý lỗi chung
const errorHandler = (err, req, res, next) => {
    // Log lỗi ra console (trong production nên dùng logger như Winston)
    console.error('Error:', {
        message: err.message,
        stack: config.nodeEnv === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString(),
        url: req.originalUrl,
        method: req.method
    });

    // Xác định status code
    const statusCode = err.statusCode || 500;

    // Response format
    const errorResponse = {
        success: false,
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
    };

    // Chỉ thêm stack trace trong development
    if (config.nodeEnv === 'development' && err.stack) {
        errorResponse.stack = err.stack;
    }

    // Thêm thông tin bổ sung nếu có
    if (err.details) {
        errorResponse.details = err.details;
    }

    res.status(statusCode).json(errorResponse);
};

// Middleware xử lý async errors
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    notFoundHandler,
    errorHandler,
    asyncHandler
};