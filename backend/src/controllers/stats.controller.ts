import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/custom';
import { User } from '../models/user.model';
import { Question } from '../models/question.model';
import { WrongQuestion } from '../models/wrong-question.model';
import { AppError } from '../utils/error';

class StatsController {
  // 获取学习统计
  async getStudyStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      res.json({
        success: true,
        data: {
          totalQuestions: user.stats.totalQuestions,
          correctCount: user.stats.correctCount,
          wrongCount: user.stats.wrongCount,
          streak: user.stats.streak,
          lastLoginAt: user.stats.lastLoginAt,
          lastAnswerAt: user.stats.lastAnswerAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取每日统计
  async getDailyStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyStats = await WrongQuestion.aggregate([
        {
          $match: {
            userId,
            lastWrongDate: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            totalWrong: { $sum: 1 },
            resolvedCount: {
              $sum: { $cond: [{ $eq: ['$isResolved', true] }, 1, 0] }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          date: today,
          ...dailyStats[0]
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取科目统计
  async getSubjectStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const subjectStats = await WrongQuestion.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$subject',
            totalWrong: { $sum: 1 },
            resolvedCount: {
              $sum: { $cond: [{ $eq: ['$isResolved', true] }, 1, 0] }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: subjectStats
      });
    } catch (error) {
      next(error);
    }
  }

  // 重置统计
  async resetStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      user.stats = {
        totalQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        streak: 0,
        lastLoginAt: user.stats.lastLoginAt,
        lastAnswerAt: null
      };

      await user.save();

      res.json({
        success: true,
        message: '统计已重置'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController(); 