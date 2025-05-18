"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsRoutes = void 0;
const express_1 = require("express");
const stats_controller_1 = require("../controllers/stats.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 需要认证的路由
router.use(auth_middleware_1.authMiddleware);
// 获取学习统计
router.get('/', stats_controller_1.statsController.getStudyStats);
// 获取每日统计
router.get('/daily', stats_controller_1.statsController.getDailyStats);
// 获取科目统计
router.get('/subjects', stats_controller_1.statsController.getSubjectStats);
// 重置统计
router.post('/reset', stats_controller_1.statsController.resetStats);
exports.statsRoutes = router;
