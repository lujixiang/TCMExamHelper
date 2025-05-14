import express from 'express';
import { exerciseController } from '../controllers/exercise.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 获取练习题目
router.get('/questions', exerciseController.getExerciseQuestions);

// 提交答案
router.post('/submit', exerciseController.submitAnswer);

// 获取练习统计
router.get('/stats', exerciseController.getExerciseStats);

// 获取推荐题目
router.get('/recommended', exerciseController.getRecommendedQuestions);

export default router; 