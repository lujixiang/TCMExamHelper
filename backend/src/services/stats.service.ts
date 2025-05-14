import { Types } from 'mongoose';
import { UserModel } from '../models/user.model';

export class StatsService {
  // 更新用户答题统计
  static async updateQuestionStats(
    userId: Types.ObjectId,
    isCorrect: boolean
  ): Promise<void> {
    const updateData: any = {
      $inc: {
        'stats.totalQuestions': 1,
        [`stats.${isCorrect ? 'correctQuestions' : 'wrongQuestions'}`]: 1
      },
      $set: {
        'stats.lastAnswerDate': new Date()
      }
    };

    // 获取用户当前统计信息
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查连续答题
    const lastAnswerDate = user.stats.lastAnswerDate;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (lastAnswerDate) {
      const lastDate = new Date(lastAnswerDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // 如果最后答题时间是昨天，增加连续答题天数
      if (lastDate.getTime() >= yesterday.getTime() && lastDate.getTime() < today.getTime()) {
        updateData.$inc['stats.dailyStreak'] = 1;
      } 
      // 如果最后答题时间不是昨天也不是今天，重置连续答题天数
      else if (lastDate.getTime() < yesterday.getTime()) {
        updateData.$set['stats.dailyStreak'] = 1;
      }
    } else {
      // 第一次答题
      updateData.$set['stats.dailyStreak'] = 1;
    }

    await UserModel.findByIdAndUpdate(userId, updateData);
  }

  // 获取用户统计信息
  static async getUserStats(userId: Types.ObjectId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const { stats } = user;
    const correctRate = stats.totalQuestions > 0
      ? (stats.correctQuestions / stats.totalQuestions * 100).toFixed(2)
      : '0.00';

    return {
      totalQuestions: stats.totalQuestions,
      correctQuestions: stats.correctQuestions,
      wrongQuestions: stats.wrongQuestions,
      correctRate: `${correctRate}%`,
      dailyStreak: stats.dailyStreak,
      lastAnswerDate: stats.lastAnswerDate
    };
  }

  // 获取用户每日答题状态
  static async getDailyStatus(userId: Types.ObjectId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const { stats } = user;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let hasAnsweredToday = false;
    if (stats.lastAnswerDate) {
      const lastAnswerDate = new Date(stats.lastAnswerDate);
      hasAnsweredToday = lastAnswerDate.getTime() >= today.getTime();
    }

    return {
      hasAnsweredToday,
      dailyStreak: stats.dailyStreak,
      lastAnswerDate: stats.lastAnswerDate
    };
  }

  // 重置用户统计
  static async resetStats(userId: Types.ObjectId): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        stats: {
          totalQuestions: 0,
          correctQuestions: 0,
          wrongQuestions: 0,
          dailyStreak: 0,
          lastAnswerDate: null
        }
      }
    });
  }
} 