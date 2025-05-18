import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { userController } from '../controllers/user.controller';

const router = Router();

// 公开路由
router.post('/register', userController.register);
router.post('/login', userController.login);

// 需要认证的路由
router.use(authMiddleware);
router.get('/me', userController.getCurrentUser);
router.put('/profile', userController.updateProfile);
router.get('/:id', userController.getUserById);

// 密码管理
router.put('/password', userController.updatePassword);

// 学习统计
router.get('/stats', userController.getStudyStats);
router.get('/stats/detail', userController.getStudyStatsDetail);

// 学习进度
router.put('/study-progress', userController.updateStudyProgress);
router.get('/study-progress/:subject?', userController.getStudyProgress);

export { router as userRoutes }; 