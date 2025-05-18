import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

// 所有路由都需要认证
router.use(auth);

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', userController.getCurrentUser);
router.put('/profile', userController.updateProfile);
router.get('/:id', userController.getUserById);

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