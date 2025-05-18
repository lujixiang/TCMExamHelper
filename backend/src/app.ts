import express from 'express';
import { Express, Request, Response } from './types/express.d';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/config';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { practiceRoutes } from './routes/practice.routes';
import { subjectRoutes } from './routes/subject.routes';
import { wrongQuestionRoutes } from './routes/wrong-question.routes';
import { statsRoutes } from './routes/stats.routes';
import { errorHandler } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { authMiddleware } from './middleware/auth.middleware';

const app: Express = express();

// 连接数据库
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 基础中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// API路由
const apiPrefix = config.apiPrefix || '/api';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/practice`, authMiddleware, practiceRoutes);
app.use(`${apiPrefix}/subjects`, authMiddleware, subjectRoutes);
app.use(`${apiPrefix}/wrong-questions`, authMiddleware, wrongQuestionRoutes);
app.use(`${apiPrefix}/stats`, authMiddleware, statsRoutes);

// 根路径处理
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '中医考试助手API服务',
    version: '1.0.0',
    endpoints: {
      auth: `${apiPrefix}/auth`,
      users: `${apiPrefix}/users`,
      practice: `${apiPrefix}/practice`,
      subjects: `${apiPrefix}/subjects`,
      wrongQuestions: `${apiPrefix}/wrong-questions`,
      stats: `${apiPrefix}/stats`
    }
  });
});

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use(errorHandler);

export default app; 
