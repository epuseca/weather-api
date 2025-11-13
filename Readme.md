## 1. Giới thiệu

- Weather API là một phần mềm cung cấp dữ liệu thời tiết của các thành phố trên toàn thế giới
- Sử dụng dữ liệu từ visualcrossing.com
- Sử dụng Redis để lưu dữ liệu
- Redis được build trên Docker Desktop

## 2. Tính năng

- Lấy thông tin dữ liệu hiện tại và 7 ngày tiếp theo
- Sử dụng Redis caching với TTL tự động trong 12h
- Sử dụng rate limiting, error handling
- Tăng tốc độ phản hồi, cache giúp trả về kết quả lập tức

## 3. Công nghệ sử dụng

- Node.js:20.18.3 Express.js Redis:7.4.2 Axios Docker Visual crossing weather API

## 4. Thư mục

weather-api/
├── src/
│   ├── config/              # Cấu hình
│   │   ├── env.js          # Environment variables
│   │   └── redis.js        # Redis client setup
│   ├── controllers/         # Controllers
│   │   └── weatherController.js
│   ├── services/            # Business logic
│   │   ├── weatherService.js    # Gọi Visual Crossing API
│   │   └── cacheService.js      # Xử lý Redis cache
│   ├── middlewares/         # Middlewares
│   │   ├── rateLimiter.js      # Rate limiting
│   │   └── errorHandler.js     # Error handling
│   └── routes/              # Route definitions
│       └── weatherRoutes.js
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── server.js               # Entry point
└── README.md

## 5. Luồng hoạt động

Client -> Express -> Controller -> Cache -> Redis
                  |                     |
             cache miss                 |
                  |                     |
                  Weather Service       |
                  |                     |
                  Visual Crossing API   |
                  |                     |
                  -------Save to cache---

## 6. Build app

* Redis
    - Cài đặt Docker desktop
    - Chạy câu lệnh trên cmd: ` docker run -d --name redis-weather -p 6379:6379 redis:latest `
        + `-d` : Chạy ở background
        + `--name redis-weather` : đặt tên container
        + `-p 6379:6379` : map port 6379
        + `redis:lastest` : phiên bản mới nhất
    - Kiểm tra Redis trên cmd
        + `docker ps`
        + Dừng chạy: `docker stop redis-weather`
        + Khởi động lại `docker start redis-weather`
    - Kiểm tra Redis bằng lệnh sử dụng redis cli
        + `docker exec -it redis-weather redis-cli`
        + Xem tất cả keys
            `KEYS *`
        + Xem giá trị của key
            `GET weather:hanoi:metric`
        + Xem thời gian còn lại của key (TTL)
            `TTL weather:hanoi:metric`
        + Xóa key
            `DEL weather:hanoi:metric`
        + Xóa tất cả
            `FLUSHALL`
        + Xem keys có pattern
            `KEYS weather:*`
        + Xem thông tin Redis
            `INFO`
        + Xem số lượng keys
            `DBSIZE`
        + Monitor realtime commands
            `MONITOR`

    ### Nâng cao hơn
    - Truy cập vào redis thông qua docker
        + Vào Redis CLI trong container
            `docker exec -it redis-weather redis-cli`
        + Hoặc nếu có password
            `docker exec -it redis-weather redis-cli -a your_password`
    - Run redis với volumn để lưu trữ dữ liệu
        + `docker volume create redis-weather-data`
        + docker run -d \
            --name redis-weather \
            -p 6379:6379 \
            -v redis-weather-data:/data \
            redis:latest redis-server --appendonly yes
    - Run redis sử dụng docker compose (prod)
        + Chạy `docker-compose up -d`
        + Kiểm tra container `docker ps`
        + Xem logs `redis-weather`
        + Kiểm tra redis hoạt động: `docker exec -it redis-weather redis-cli ping` kết quả: PONG

        * Các câu lệnh trên docker
            + `docker stop redis-weather`
            + `docker start redis-weather`
            + `docker restart redis-weather`
            + `docker logs redis-weather`
            + `docker logs -f redis-weather`
            + `docker rm redis-weather`
            + `docker rm redis-weather docker volume rm redis-weather-data`
* Node.js app
    - Tạo package.json : `npm init -y`
    - Install   `npm install express axios redis dotenv express-rate-limit`
                `npm install -D nodemon`
    - .env:     WEATHER_API_KEY=`key lấy trên visual crossing`
                REDIS_HOST=
                REDIS_PORT=
                PORT=
                CACHE_EXPIRATION=
    - Run backend: `npm start`

* Api test
    - `GET /api/weather/:city`
        + parameter: city
        + query parameters: unit: metric, us, uk
    - `DELETE /api/cache/:city`
    - `DELETE /api/cache`
* Cách hoạt động
    - Client req /api/weather/hanoi -> rate limiter -> controller validate input -> [Cachehit] trả về data từ redis / [Cachemiss] trả về data từ Visual crossing api -> lưu kết quả vào redis TTL 12hrs -> trả về response
    - Caching format: `weather:{city}:{unit}`

### Kết luận
1. Cách chạy code
    - Cài đặt: docker, redis, nodejs
    - Cài đặt redis: `docker run -d --name redis-weather -p 6379:6379 redis:latest`
    - Cặt đặt nodejs:   `npm init -y`
                        `npm i`
                        `npm start`
    - Test api: postman

### Link 

https://roadmap.sh/projects/weather-api-wrapper-service