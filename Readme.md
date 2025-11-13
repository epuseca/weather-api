# Weather API

Một dịch vụ nhỏ cung cấp dữ liệu thời tiết (hiện tại + dự báo 7 ngày) cho các thành phố trên toàn thế giới. Dữ liệu được lấy từ Visual Crossing Weather API và được cache bằng Redis để tăng tốc phản hồi.

> Lưu ý: file này trình bày cách chạy dự án cục bộ (development) và các lệnh hữu ích để kiểm thử Redis.

## Nội dung chính

- Mô tả ngắn gọn dự án
- Hướng dẫn cài đặt và chạy (Redis bằng Docker + Node.js)
- Biến môi trường cần thiết
- Các endpoint API và ví dụ
- Cấu trúc thư mục
- Các lệnh Redis hữu ích

---

## Tính năng

- Trả về dữ liệu thời tiết hiện tại và dự báo 7 ngày
- Caching bằng Redis với TTL mặc định (12 giờ)
- Rate limiting và error handling cơ bản
- Trả kết quả nhanh hơn khi cache hit

## Công nghệ sử dụng

- Node.js (20.x)
- Express
- Redis
- Axios
- Docker (để chạy Redis nếu cần)
- Visual Crossing Weather API

## Cấu trúc thư mục

```
weather-api/
├── src/
│   ├── config/              # Cấu hình
│   │   ├── env.js           # Environment variables
│   │   └── redis.js         # Redis client setup
│   ├── controllers/         # Controllers
│   │   └── weatherController.js
│   ├── services/            # Business logic
│   │   ├── weatherService.js    # Gọi Visual Crossing API
│   │   └── cacheService.js      # Xử lý Redis cache
│   ├── middlewares/         # Middlewares
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── errorHandler.js      # Error handling
│   └── routes/              # Route definitions
│       └── weatherRoutes.js
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── server.js                # Entry point
└── README.md
```

## Luồng hoạt động

```
Client -> Express -> Controller -> Cache -> Redis
                  |                     |
             cache miss                 |
                  |                     |
                  Weather Service       |
                  |                     |
                  Visual Crossing API   |
                  |                     |
                  -------Save to cache---
```

## Yêu cầu (Prerequisites)

- Docker (để chạy Redis cục bộ)
- Node.js v20+ và npm
- Key từ Visual Crossing (WEATHER_API_KEY)

## Biến môi trường (ví dụ `.env`)

```
WEATHER_API_KEY=your_visual_crossing_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
PORT=3000
CACHE_EXPIRATION=43200    # giây (12 giờ)
```

## Chạy Redis (local / development)

Cách nhanh (Docker run):

```powershell
# chạy Redis trong container (background)
docker run -d --name redis-weather -p 6379:6379 redis:latest

# kiểm tra container
docker ps

# stop / start
docker stop redis-weather
docker start redis-weather

# vào redis-cli (nếu cần)
docker exec -it redis-weather redis-cli
```

Lưu trữ dữ liệu bằng volume:

```powershell
docker volume create redis-weather-data
docker run -d --name redis-weather -p 6379:6379 -v redis-weather-data:/data redis:latest redis-server --appendonly yes
```

Sử dụng Docker Compose (nếu có `docker-compose.yml`):

```powershell
docker-compose up -d
```

Lệnh kiểm tra hoạt động:

```powershell
docker exec -it redis-weather redis-cli ping  # trả về PONG
```

Các lệnh Redis hữu ích (trong `redis-cli`):

```
KEYS *
GET weather:hanoi:metric
TTL weather:hanoi:metric
DEL weather:hanoi:metric
FLUSHALL
KEYS weather:*
INFO
DBSIZE
MONITOR
```

## Cài đặt và chạy Node.js app

```powershell
# cài dependencies
npm install

# phát triển với nodemon (nếu đã cài -D nodemon)
npm run dev    # hoặc npm start theo script trong package.json
```

## API Endpoints

- GET /api/weather/:city
  - path parameter: `city` (ví dụ: `hanoi`)
  - query parameters: `unit` (ví dụ: `metric`, `us`, `uk`)
  - trả về dữ liệu thời tiết (cached nếu có)

- DELETE /api/cache/:city
  - xóa cache cho thành phố

- DELETE /api/cache
  - xóa toàn bộ cache (chỉ dùng khi cần)

Ví dụ curl:

```bash
curl "http://localhost:3000/api/weather/hanoi?unit=metric"
```

## Cách hoạt động tóm tắt

- Client gửi yêu cầu tới `/api/weather/:city`
- Middleware rate limiter chặn quá nhiều request
- Controller kiểm tra cache (Redis)
  - Nếu cache hit -> trả dữ liệu từ Redis
  - Nếu cache miss -> gọi Visual Crossing API, lưu kết quả vào Redis (TTL 12 giờ), sau đó trả kết quả

Format cache: `weather:{city}:{unit}`

## Kiểm tra và gỡ lỗi

- Kiểm tra logs của server để xem lỗi
- Kiểm tra container Redis (docker ps, docker logs)
- Dùng `redis-cli` để kiểm tra key/TTL

## Gợi ý triển khai / production

- Dùng Redis managed (Azure Cache, AWS ElastiCache) cho production
- Cấu hình rate limiting, logging, monitoring
- Bảo vệ API key (store trong secret manager)

## Liên kết

- Project reference: https://roadmap.sh/projects/weather-api-wrapper-service

---
