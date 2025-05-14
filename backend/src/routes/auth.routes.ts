import express from 'express';
import { authController } from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// 公开路由
router.post('/register', authController.register);
router.post('/login', authController.login);

// 需要认证的路由
router.get('/me', auth, authController.getCurrentUser);
router.patch('/profile', auth, authController.updateProfile);
router.patch('/password', auth, authController.changePassword);

export default router; 