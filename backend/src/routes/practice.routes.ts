import express from 'express';
import { practiceController } from '../controllers/practice.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 获取科目的所有章节
router.get('/:subject/chapters', (req, res, next) => practiceController.getChapters(req, res, next));

// 获取章节的题目
router.get('/:subject/chapters/:chapterNo', (req, res, next) => practiceController.getChapterQuestions(req, res, next));

// 每日练习
router.get('/daily', (req, res, next) => practiceController.getDailyQuestions(req, res, next));

// 获取专项练习题目
router.get('/topic/:subject', (req, res, next) => practiceController.getTopicQuestions(req, res, next));

// 模拟考试
router.get('/exam', (req, res, next) => practiceController.getExamQuestions(req, res, next));

// 强化训练
router.get('/enhance', (req, res, next) => practiceController.getEnhanceQuestions(req, res, next));

// 提交答案
router.post('/submit', (req, res, next) => practiceController.submitAnswer(req, res, next));

export default router; 