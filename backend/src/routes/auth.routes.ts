import express from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const authRoutes = express.Router();

// 注册
authRoutes.post('/register', authController.register);

// 登录
authRoutes.post('/login', authController.login);

// 刷新token
authRoutes.post('/refresh-token', authController.refreshToken);

// 登出
authRoutes.post('/logout', authMiddleware, authController.logout);

// 验证token
authRoutes.get('/verify', authMiddleware, authController.verifyToken);

// 需要认证的路由
authRoutes.get('/me', authMiddleware, authController.getCurrentUser);
authRoutes.patch('/profile', authMiddleware, authController.updateProfile);
authRoutes.patch('/password', authMiddleware, authController.changePassword); 