import express from 'express';
import { statsController } from '../controllers/stats.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 获取用户统计信息
router.get('/', statsController.getUserStats);

// 获取每日答题状态
router.get('/daily', statsController.getDailyStatus);

// 重置用户统计
router.post('/reset', statsController.resetStats);

export default router; 