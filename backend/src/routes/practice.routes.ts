import express from 'express';
import { practiceController } from '../controllers/practice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// 获取科目的所有章节
router.get('/chapters/:subject', authMiddleware, practiceController.getChapters);

// 获取章节的题目
router.get('/chapters/:subject/:chapterNo', authMiddleware, practiceController.getChapterQuestions);

// 获取每日练习题目
router.get('/daily', authMiddleware, practiceController.getDailyQuestions);

// 获取专项练习题目
router.get('/topic/:subject', authMiddleware, practiceController.getTopicQuestions);

// 获取模拟考试题目
router.get('/exam', authMiddleware, practiceController.getExamQuestions);

// 获取强化训练题目
router.get('/enhance', authMiddleware, practiceController.getEnhanceQuestions);

// 获取智能推荐题目
router.get('/recommended', authMiddleware, practiceController.getRecommendedQuestions);

// 提交答案
router.post('/submit', authMiddleware, practiceController.submitAnswer);

// 获取练习统计
router.get('/stats', authMiddleware, practiceController.getExerciseStats);

export const practiceRoutes = router; 