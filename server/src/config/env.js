import dotenv from 'dotenv';

dotenv.config();

export const env = process.env.NODE_ENV || 'development';
export const isDevelopment = env === 'development';
export const isTest = env === 'test';
export const port = process.env.PORT || 3001;
export const jwtSecret = process.env.JWT_SECRET;
export const corsAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS || '';
