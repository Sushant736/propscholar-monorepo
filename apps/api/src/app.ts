import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { database } from './config/database.js';
import { EmailService } from './services/emailService.js';
import routes from './routes/index.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app: Express = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://localhost:3001', process.env.ADMIN_URL || 'http://localhost:3002']
    : true,

  credentials: true
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Routes
app.use('/api', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR] Unhandled error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Initialize services and start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    console.log('[INFO] Database connected successfully');

    // Initialize email service
    try {
      await EmailService.initialize();
      console.log('[INFO] Email service initialized successfully');
    } catch (emailError) {
      console.warn('[WARN] Email service initialization failed:', emailError);
      console.warn('[WARN] Server will continue without email functionality');
    }

    // Start server
    const server = app.listen(port, () => {
      console.log(`[INFO] Server running at http://localhost:${port}`);
      console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('[INFO] API endpoints:');
      console.log(`[INFO]   - Health check: http://localhost:${port}/api/health`);
      console.log(`[INFO]   - Authentication: http://localhost:${port}/api/auth`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`[INFO] ${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('[INFO] HTTP server closed');
        
        try {
          await database.disconnect();
          console.log('[INFO] Database disconnected');
        } catch (error) {
          console.error('[ERROR] Error disconnecting from database:', error);
        }
        
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('[ERROR] Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app; 