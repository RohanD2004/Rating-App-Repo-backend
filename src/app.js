import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { httpLogger } from './config/logger.js';
import healthRouter from './routes/v1/health.routes.js';
import authRouter from './routes/v1/auth.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import dotenv from 'dotenv';
import { sequelize } from './db/db-utils.js';
import storeRouter from './routes/v1/storeRoutes.js';
import adminRouter from './routes/v1/admin.routes.js';
import ownerRouter from './routes/v1/owner.routes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Request logging
app.use(httpLogger);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Security middleware
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// API documentation landing page
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);

app.use('/api/v1/stores', storeRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/owner', ownerRouter);
// Error handling must be last
app.use(errorMiddleware);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  sequelize.sync({ alter: true }) // Use { force: true } for development to reset tables
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch(err => {
    console.error('Error synchronizing the database:', err);
  });

export default app;
