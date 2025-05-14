import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(auth);

// 更新用户资料
router.put('/profile', userController.updateProfile);

// 更新密码
router.put('/password', userController.updatePassword);

// 获取学习统计
router.get('/stats', userController.getStudyStats);

// 获取学习统计详情
router.get('/stats/detail', userController.getStudyStatsDetail);

// 更新学习进度
router.put('/study-progress', userController.updateStudyProgress);

// 获取学习进度
router.get('/study-progress/:subject?', userController.getStudyProgress);

export default router; 