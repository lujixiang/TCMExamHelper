import { Router } from '../types/express';
import { practiceController } from '../controllers/practice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 获取科目章节
router.get('/:subject/chapters', practiceController.getChapters);

// 获取章节题目
router.get('/:subject/chapters/:chapterNo', practiceController.getChapterQuestions);

// 获取每日练习题目
router.get('/daily', practiceController.getDailyQuestions);

// 获取专项练习题目
router.get('/:subject/topic', practiceController.getTopicQuestions);

// 获取模拟考试题目
router.get('/exam', practiceController.getExamQuestions);

// 获取强化训练题目
router.get('/enhance', practiceController.getEnhanceQuestions);

// 获取智能推荐题目
router.get('/recommend', practiceController.getRecommendedQuestions);

// 提交答案
router.post('/submit', practiceController.submitAnswer);

export const practiceRoutes = router; 