import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tcm_exam_helper',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  env: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api'
}; 