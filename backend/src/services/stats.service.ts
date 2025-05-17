import { Types } from 'mongoose';
import { User } from '../models/user.model';
import { WrongQuestion } from '../models/wrong-question.model';
import { Question } from '../models/question.model';

export class StatsService {
  // 获取用户统计信息
  static async getUserStats(userId: Types.ObjectId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const totalQuestions = await Question.countDocuments();
    const completedQuestions = await WrongQuestion.distinct('questionId', { userId });
    const wrongQuestions = await WrongQuestion.find({ userId, isResolved: false });

    const stats = {
      totalQuestions,
      correctCount: completedQuestions.length - wrongQuestions.length,
      wrongCount: wrongQuestions.length,
      streak: user.streak || 0,
      lastLoginDate: user.lastLoginDate || new Date(),
      lastAnswerDate: user.lastAnswerDate || new Date()
    };

    return stats;
  }

  // 更新用户统计信息
  static async updateUserStats(userId: Types.ObjectId, isCorrect: boolean) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const now = new Date();
    const lastDate = user.lastAnswerDate || now;
    const isNewDay = now.getDate() !== lastDate.getDate() ||
                    now.getMonth() !== lastDate.getMonth() ||
                    now.getFullYear() !== lastDate.getFullYear();

    let streak = user.streak || 0;
    if (isNewDay) {
      streak = isCorrect ? streak + 1 : 0;
    }

    await User.findByIdAndUpdate(userId, {
      $inc: {
        [`stats.${isCorrect ? 'correctCount' : 'wrongCount'}`]: 1
      },
      $set: {
        streak,
        lastAnswerDate: now
      }
    });

    return {
      streak,
      lastAnswerDate: now
    };
  }

  // 获取用户学习进度
  static async getLearningProgress(userId: Types.ObjectId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const totalQuestions = await Question.countDocuments();
    const completedQuestions = await WrongQuestion.distinct('questionId', { userId });
    const wrongQuestions = await WrongQuestion.find({ userId, isResolved: false });

    const progress = {
      totalQuestions,
      completedCount: completedQuestions.length,
      correctCount: completedQuestions.length - wrongQuestions.length,
      wrongCount: wrongQuestions.length,
      accuracy: completedQuestions.length ? 
        ((completedQuestions.length - wrongQuestions.length) / completedQuestions.length * 100).toFixed(2) : 
        0,
      streak: user.streak || 0,
      lastAnswerDate: user.lastAnswerDate || new Date()
    };

    return progress;
  }
} 