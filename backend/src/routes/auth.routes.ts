import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// 简单的测试路由
router.get('/test', (req, res) => {
  res.json({ success: true, message: '路由测试成功' });
});

// 检查用户名和邮箱可用性
router.get('/check-username', authController.checkUsername);
router.get('/check-email', authController.checkEmail);

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