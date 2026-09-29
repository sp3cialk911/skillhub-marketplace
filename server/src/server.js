import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import dotenv from 'dotenv';
import { pool } from './database/db.js';
import authRoutes from './api/auth.js';
import productRoutes from './api/products.js';
import courseRoutes from './api/courses.js';
import skillRoutes from './api/skills.js';
import paymentRoutes from './api/payments.js';
import userRoutes from './api/users.js';
import reviewRoutes from './api/reviews.js';
import messageRoutes from './api/messages.js';
import bookingRoutes from './api/bookings.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Error Handler
app.use(errorHandler);

// Database Connection Test
pool.query('SELECT NOW()', (err, _res) => {
  if (err) {
    logger.error('Database connection failed:', err);
  } else {
    logger.info('Database connected successfully');
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

export default app;
