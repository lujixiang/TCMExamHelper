import { Router } from '../types/express';
import { subjectController } from '../controllers/subject.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 需要认证的路由
router.use(authMiddleware);

// 获取所有科目
router.get('/', subjectController.getSubjects);

// 获取科目详情
router.get('/:subject', subjectController.getSubjectDetail);

// 获取科目章节
router.get('/:subject/chapters', subjectController.getSubjectChapters);

// 获取科目题目数量
router.get('/:subject/count', subjectController.getQuestionCount);

export const subjectRoutes = router; 