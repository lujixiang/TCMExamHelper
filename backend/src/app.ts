import express from 'express';
import mongoose, { Error } from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import practiceRoutes from './routes/practice.routes';
import wrongQuestionRoutes from './routes/wrong-question.routes';
import { errorHandler } from './middleware/error.middleware';

// 导入路由
import subjectRoutes from './routes/subject.routes';
import userRoutes from './routes/user.routes';
import statsRoutes from './routes/stats.routes';

// 加载环境变量
dotenv.config();

const app = express();

// 环境变量
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const API_PREFIX = process.env.API_PREFIX || '/api';
const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';

// CORS配置
const corsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.urlencoded({ extended: true }));

// API路由
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/practice`, practiceRoutes);
app.use(`${API_PREFIX}/wrong-questions`, wrongQuestionRoutes);
app.use(`${API_PREFIX}/subjects`, subjectRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/stats`, statsRoutes);

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tcm_exam';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`[${LOG_LEVEL}] MongoDB 数据库连接成功`);
  })
  .catch((error: Error) => {
    console.error(`[${LOG_LEVEL}] MongoDB 数据库连接失败:`, error);
    process.exit(1);
  });

// 错误处理中间件
app.use(errorHandler);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 添加健康检查路由
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`[${LOG_LEVEL}] 服务器运行在 ${NODE_ENV} 模式下的端口 ${PORT}`);
  console.log(`[${LOG_LEVEL}] API 前缀: ${API_PREFIX}`);
  console.log(`[${LOG_LEVEL}] CORS 已启用: ${CORS_ORIGIN}`);
});

export default app; 