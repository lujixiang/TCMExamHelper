"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// 用户注册
router.post('/register', auth_controller_1.authController.register);
// 用户登录
router.post('/login', auth_controller_1.authController.login);
// 刷新令牌
router.post('/refresh-token', auth_controller_1.authController.refreshToken);
// 修改密码
router.post('/change-password', auth_controller_1.authController.changePassword);
// 重置密码请求
router.post('/reset-password-request', auth_controller_1.authController.resetPasswordRequest);
// 重置密码
router.post('/reset-password', auth_controller_1.authController.resetPassword);
exports.authRoutes = router;
