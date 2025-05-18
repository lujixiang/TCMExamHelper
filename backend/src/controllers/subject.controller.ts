import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/custom';
import { Question } from '../models/question.model';
import { AppError } from '../utils/error';

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

  // 获取科目详情
  async getSubjectDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject } = req.params;
      
      const totalQuestions = await Question.countDocuments({ subject });
      const questionsByDifficulty = await Question.aggregate([
        { $match: { subject } },
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          subject,
          totalQuestions,
          questionsByDifficulty
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取科目章节
  async getSubjectChapters(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject } = req.params;
      
      const chapters = await Question.aggregate([
        { $match: { subject } },
        {
          $group: {
            _id: '$chapterNo',
            questionCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        success: true,
        data: chapters
      });
    } catch (error) {
      next(error);
    }
  }
}

export const subjectController = new SubjectController(); 