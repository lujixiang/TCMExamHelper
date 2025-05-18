import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/config';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import practiceRoutes from './routes/practice.routes';
import subjectRoutes from './routes/subject.routes';
import wrongQuestionRoutes from './routes/wrong-question.routes';
import statsRoutes from './routes/stats.routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

const app = express();

// 连接数据库
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 基础中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use(requestLogger);

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/wrong-questions', wrongQuestionRoutes);
app.use('/api/stats', statsRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use(errorHandler);

export { app }; 
