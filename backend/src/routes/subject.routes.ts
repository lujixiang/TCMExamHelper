import express from 'express';
import { subjectController } from '../controllers/subject.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// 获取所有科目列表
router.get('/', auth, (req, res, next) => subjectController.getSubjects(req, res, next));

// 获取特定科目的题目数量
router.get('/:subject/count', auth, (req, res, next) => subjectController.getQuestionCount(req, res, next));

export default router; 