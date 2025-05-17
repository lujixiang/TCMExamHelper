import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { IUser } from '../models/user.model';
import { PracticeService } from '../services/practice.service';

interface AuthRequest extends Request {
  user?: IUser;
}

class PracticeController {
  // 获取科目的所有章节
  async getChapters(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject } = req.params;
      const chapters = await PracticeService.getChapters(subject);
      
      res.json({
        success: true,
        data: chapters
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取章节的题目（添加分页支持）
  async getChapterQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject, chapterNo } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await PracticeService.getChapterQuestions(
        subject,
        Number(chapterNo),
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取每日练习题目
  async getDailyQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const questions = await PracticeService.getDailyQuestions();
      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取专项练习题目
  async getTopicQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject } = req.params;
      const { count = 20, difficulty } = req.query;

      const questions = await PracticeService.getTopicQuestions(
        subject,
        Number(count),
        difficulty ? Number(difficulty) : undefined
      );

      if (questions.length === 0) {
        return res.status(404).json({
          success: false,
          message: '未找到该科目的题目'
        });
      }

      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取模拟考试题目
  async getExamQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const questions = await PracticeService.getExamQuestions();
      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取强化训练题目
  async getEnhanceQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const questions = await PracticeService.getEnhanceQuestions(new Types.ObjectId(userId));
      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取智能推荐题目
  async getRecommendedQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const questions = await PracticeService.getRecommendedQuestions(new Types.ObjectId(userId));
      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  }

  // 提交答案
  async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const { questionId, answer } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const result = await PracticeService.submitAnswer(
        new Types.ObjectId(userId),
        questionId,
        answer
      );

      res.json({
        success: true,
        message: '提交成功',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取练习统计
  async getExerciseStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const stats = await PracticeService.getExerciseStats(new Types.ObjectId(userId));
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export const practiceController = new PracticeController(); 