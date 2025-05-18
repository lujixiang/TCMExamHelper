"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectRoutes = void 0;
const express_1 = require("express");
const subject_controller_1 = require("../controllers/subject.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 需要认证的路由
router.use(auth_middleware_1.authMiddleware);
// 获取所有科目
router.get('/', subject_controller_1.subjectController.getSubjects);
// 获取科目详情
router.get('/:subject', subject_controller_1.subjectController.getSubjectDetail);
// 获取科目章节
router.get('/:subject/chapters', subject_controller_1.subjectController.getSubjectChapters);
// 获取科目题目数量
router.get('/:subject/count', subject_controller_1.subjectController.getQuestionCount);
exports.subjectRoutes = router;
