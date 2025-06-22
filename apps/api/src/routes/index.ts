import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import authRoutes from './authRoutes.js';

const router: ExpressRouter = Router();

// API routes
router.use('/auth', authRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PropScholar API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health'
    },
    documentation: 'Visit /api/health for API status'
  });
});

export default router; 