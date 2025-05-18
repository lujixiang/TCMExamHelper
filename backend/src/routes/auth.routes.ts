import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 刷新令牌
router.post('/refresh-token', authController.refreshToken);

// 修改密码
router.post('/change-password', authController.changePassword);

// 重置密码请求
router.post('/reset-password-request', authController.resetPasswordRequest);

// 重置密码
router.post('/reset-password', authController.resetPassword);

export const authRoutes = router; 