import { Router } from 'express';
import { wrongQuestionController } from '../controllers/wrong-question.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 需要认证的路由
router.use(authMiddleware);

// 获取错题列表
router.get('/', wrongQuestionController.getWrongQuestions);

// 获取错题详情
router.get('/:id', wrongQuestionController.getWrongQuestionById);

// 更新错题状态
router.put('/:id', wrongQuestionController.updateWrongQuestion);

// 删除错题
router.delete('/:id', wrongQuestionController.deleteWrongQuestion);

// 批量删除错题
router.post('/batch-delete', wrongQuestionController.batchDeleteWrongQuestions);

// 批量更新错题状态
router.put('/batch-update', wrongQuestionController.batchUpdateStatus);

// 清空错题记录
router.delete('/clear', wrongQuestionController.clearWrongQuestions);

// 获取高频错题
router.get('/frequent', wrongQuestionController.getFrequentWrongQuestions);

// 获取最近错题
router.get('/recent', wrongQuestionController.getRecentWrongQuestions);

export const wrongQuestionRoutes = router; 