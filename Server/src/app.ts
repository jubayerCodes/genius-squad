import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import applicationRoutes from './routes/index.js';
import { globalErrorHandler } from './middlewares/globalErrorHandler.js';
import { AppError } from './lib/AppError.js';

dotenv.config();

export const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from all origins (including Vercel preview URLs and localhost)
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads (supports local disk and serverless /tmp)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads', express.static(path.join(os.tmpdir(), 'uploads')));

// Root Endpoint - Operational confirmation
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Genius Squad API Server is live and operational.',
    healthCheck: '/api/v1/health',
    timestamp: new Date().toISOString(),
  });
});

// Health Check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: 'Genius Squad Modular API Server (v1) is up and running!',
    timestamp: new Date().toISOString(),
  });
});

// Dynamic Application Routes Mounted at /api/v1
app.use('/api/v1', applicationRoutes);

// 404 Handler
app.use((req: Request, res: Response, next) => {
  next(new AppError(404, `রাউট ${req.originalUrl} খুঁজে পাওয়া যায়নি (Not Found)`));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
