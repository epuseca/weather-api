const express = require('express');
const config = require('./src/config/env');
const { createRedisClient, closeRedisConnection } = require('./src/config/redis');
const weatherRoutes = require('./src/routes/weatherRoutes');
const weatherController = require('./src/controller/weatherController');
const { notFoundHandler, errorHandler } = require('./src/middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (nếu cần)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Routes
app.get('/', weatherController.healthCheck);
app.use('/api', weatherRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Khởi động server
const startServer = async () => {
    try {
        // Kết nối Redis
        await createRedisClient();

        // Khởi động Express server
        app.listen(config.port, () => {
            console.log('=================================');
            console.log(`Server running on port ${config.port}`);
            console.log(`URL: http://localhost:${config.port}`);
            console.log(`Environment: ${config.nodeEnv}`);
            console.log('=================================');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`\n${signal} received. Closing server gracefully...`);

    await closeRedisConnection();

    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Xử lý uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start
startServer();