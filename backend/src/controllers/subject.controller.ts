import { Request, Response, NextFunction } from 'express';
import { Question } from '../models/question.model';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

class SubjectController {
  // 获取所有科目列表
  async getSubjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subjects = await Question.distinct('subject');
      
      // 获取每个科目的题目数量
      const subjectsWithCount = await Promise.all(
        subjects.map(async (subject) => {
          const questionCount = await Question.countDocuments({ subject });
          return {
            _id: subject,
            name: subject,
            questionCount
          };
        })
      );

      res.json({
        success: true,
        data: subjectsWithCount
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取特定科目的题目数量
  async getQuestionCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject } = req.params;
      const count = await Question.countDocuments({ subject });

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const subjectController = new SubjectController(); 