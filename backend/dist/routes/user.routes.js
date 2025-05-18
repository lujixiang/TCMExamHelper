"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
exports.userRoutes = router;
// 公开路由
router.post('/register', user_controller_1.userController.register);
router.post('/login', user_controller_1.userController.login);
// 需要认证的路由
router.use(auth_middleware_1.authMiddleware);
router.get('/me', user_controller_1.userController.getCurrentUser);
router.put('/profile', user_controller_1.userController.updateProfile);
router.get('/:id', user_controller_1.userController.getUserById);
// 密码管理
router.put('/password', user_controller_1.userController.updatePassword);
// 学习统计
router.get('/stats', user_controller_1.userController.getStudyStats);
router.get('/stats/detail', user_controller_1.userController.getStudyStatsDetail);
// 学习进度
router.put('/study-progress', user_controller_1.userController.updateStudyProgress);
router.get('/study-progress/:subject?', user_controller_1.userController.getStudyProgress);
