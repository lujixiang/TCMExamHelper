import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 需要认证的路由
router.use(authMiddleware);

// 获取学习统计
router.get('/', statsController.getStudyStats);

// 获取每日统计
router.get('/daily', statsController.getDailyStats);

// 获取科目统计
router.get('/subjects', statsController.getSubjectStats);

// 重置统计
router.post('/reset', statsController.resetStats);

export const statsRoutes = router; 