const axios = require('axios');
const config = require('../config/env');

// Format dữ liệu thời tiết
const formatWeatherData = (rawData) => {
    return {
        city: rawData.resolvedAddress,
        timezone: rawData.timezone,
        latitude: rawData.latitude,
        longitude: rawData.longitude,
        current: {
            datetime: rawData.currentConditions.datetime,
            temp: rawData.currentConditions.temp,
            feelslike: rawData.currentConditions.feelslike,
            humidity: rawData.currentConditions.humidity,
            precip: rawData.currentConditions.precip,
            precipprob: rawData.currentConditions.precipprob,
            snow: rawData.currentConditions.snow,
            windspeed: rawData.currentConditions.windspeed,
            pressure: rawData.currentConditions.pressure,
            visibility: rawData.currentConditions.visibility,
            cloudcover: rawData.currentConditions.cloudcover,
            uvindex: rawData.currentConditions.uvindex,
            conditions: rawData.currentConditions.conditions,
            icon: rawData.currentConditions.icon
        },
        description: rawData.description,
        forecast: rawData.days.slice(0, 7).map(day => ({
            date: day.datetime,
            tempMax: day.tempmax,
            tempMin: day.tempmin,
            temp: day.temp,
            humidity: day.humidity,
            precip: day.precip,
            precipprob: day.precipprob,
            windspeed: day.windspeed,
            conditions: day.conditions,
            description: day.description,
            icon: day.icon
        }))
    };
};

// Xử lý lỗi
const handleError = (error) => {
    if (error.response) {
        // Lỗi từ API Visual Crossing
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;

        switch (status) {
            case 400:
                throw new Error(`Tên thành phố không hợp lệ: ${message}`);
            case 401:
                throw new Error('API key không hợp lệ');
            case 429:
                throw new Error('Đã vượt quá giới hạn số lần gọi API');
            case 500:
                throw new Error('Lỗi server của Visual Crossing API');
            default:
                throw new Error(`Lỗi API: ${message}`);
        }
    } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        throw new Error('Không thể kết nối đến Visual Crossing API. Vui lòng kiểm tra kết nối mạng.');
    } else {
        // Lỗi khác
        throw new Error(`Lỗi: ${error.message}`);
    }
};

const fetchWeatherData = async (city, unitGroup = 'metric') => {
    try {
        const url = `${config.weather.baseUrl}/${encodeURIComponent(city)}`;

        const response = await axios.get(url, {
            params: {
                unitGroup,
                key: config.weather.apiKey,
                contentType: 'json'
            },
            timeout: 10000 // Timeout 10 giây
        });

        return formatWeatherData(response.data);
    } catch (error) {
        handleError(error);
    }
};

// Kiểm tra API key có hợp lệ không
const validateApiKey = async () => {
    try {
        await fetchWeatherData('London', 'metric');
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = {
    fetchWeatherData,
    validateApiKey
};