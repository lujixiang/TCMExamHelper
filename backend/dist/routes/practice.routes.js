"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.practiceRoutes = void 0;
const express_1 = require("express");
const practice_controller_1 = require("../controllers/practice.controller");
const router = (0, express_1.Router)();
// 获取科目章节
router.get('/:subject/chapters', practice_controller_1.practiceController.getChapters);
// 获取章节题目
router.get('/:subject/chapters/:chapterNo', practice_controller_1.practiceController.getChapterQuestions);
// 获取每日练习题目
router.get('/daily', practice_controller_1.practiceController.getDailyQuestions);
// 获取专项练习题目
router.get('/:subject/topic', practice_controller_1.practiceController.getTopicQuestions);
// 获取模拟考试题目
router.get('/exam', practice_controller_1.practiceController.getExamQuestions);
// 获取强化训练题目
router.get('/enhance', practice_controller_1.practiceController.getEnhanceQuestions);
// 获取智能推荐题目
router.get('/recommend', practice_controller_1.practiceController.getRecommendedQuestions);
// 提交答案
router.post('/submit', practice_controller_1.practiceController.submitAnswer);
exports.practiceRoutes = router;
