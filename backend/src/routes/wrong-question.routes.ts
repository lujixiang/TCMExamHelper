import express from 'express';
import { wrongQuestionController } from '../controllers/wrong-question.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 获取错题列表
router.get('/', wrongQuestionController.getWrongQuestions);

// 获取错题统计
router.get('/stats', wrongQuestionController.getWrongQuestionStats);

// 删除错题记录
router.delete('/:questionId', wrongQuestionController.deleteWrongQuestion);

// 更新错题状态
router.patch('/:questionId/status', wrongQuestionController.updateStatus);

export default router; 