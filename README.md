# Rating Backend

Express/PostgreSQL backend for the store rating challenge.

## Project Structure

```
ratingbackend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── routes/          # Route definitions
│   ├── middlewares/     # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── app.js       # Express app setup
├── package.json
├── server.js        # Entry point
└── .env.example         # Environment template
```

## Features

- JWT authentication with Admin, User, and StoreOwner roles
- PostgreSQL persistence through Sequelize
- Role-protected admin and store-owner dashboards
- Store search, sorting, pagination, and rating submission/update
- Helmet, CORS, rate limiting, validation, and structured logging


## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3000
   curl http://localhost:3000/api/v1/health
   ```

## API Endpoints

- `POST /api/v1/auth/register` and `POST /api/v1/auth/login`
- `GET /api/v1/auth/profile` and `PATCH /api/v1/auth/password`
- `GET /api/v1/stores` and `POST /api/v1/stores/:storeId/ratings`
- `GET /api/v1/admin/dashboard`
- `GET|POST /api/v1/admin/users`, `GET /api/v1/admin/users/:userId`
- `GET|POST /api/v1/admin/stores`
- `GET /api/v1/owner/stores/:storeId/ratings`

Authenticated requests use `Authorization: Bearer <token>`.

## Available Scripts

- `npm start` - Start development server with hot reload
- `npm start` - Start production server

- `npm test` - Run tests

## Health Check

The server includes a health check endpoint at `/api/v1/health` that returns:
- Server status
- Timestamp
- Node.js version
- Environment

## Deployment

1. Build the project (if TypeScript):
   ```bash
   npm run build
   ```

2. Set production environment:
   ```bash
   NODE_ENV=production npm start
   ```

3. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name "ratingbackend"
   ```
add your actual secret in .env file and the run the command 
first -> npm i  (in project root directory)
second -> npm run dev in same directory