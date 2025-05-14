import { Types } from 'mongoose';
import { QuestionModel } from '../models/question.model';
import { WrongQuestionModel } from '../models/wrongQuestion.model';
import { StatsService } from './stats.service';

export class ExerciseService {
  // 获取练习题目
  static async getExerciseQuestions(options: {
    userId: Types.ObjectId;
    subject?: string;
    chapterNo?: number;
    type?: string;
    tags?: string[];
    limit?: number;
    excludeAnswered?: boolean;
  }) {
    const {
      userId,
      subject,
      chapterNo,
      type,
      tags,
      limit = 10,
      excludeAnswered = false
    } = options;

    // 构建查询条件
    const query: any = {};
    if (subject) query.subject = subject;
    if (chapterNo) query.chapterNo = chapterNo;
    if (type) query.type = type;
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // 如果需要排除已答过的题目
    if (excludeAnswered) {
      const answeredQuestions = await WrongQuestionModel.find(
        { userId },
        { questionId: 1 }
      );
      const answeredIds = answeredQuestions.map(q => q.questionId);
      query._id = { $nin: answeredIds };
    }

    // 随机获取题目
    const questions = await QuestionModel.aggregate([
      { $match: query },
      { $sample: { size: limit } }
    ]);

    return questions;
  }

  // 提交答案
  static async submitAnswer(
    userId: Types.ObjectId,
    questionId: Types.ObjectId,
    userAnswer: string
  ) {
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      throw new Error('题目不存在');
    }

    const isCorrect = question.correctAnswer === userAnswer;

    // 更新统计信息
    await StatsService.updateQuestionStats(userId, isCorrect);

    // 如果答错了，添加到错题本
    if (!isCorrect) {
      await WrongQuestionModel.findOneAndUpdate(
        { userId, questionId },
        {
          $setOnInsert: {
            subject: question.subject,
            content: question.content,
            options: question.options,
            correctAnswer: question.correctAnswer,
            createdAt: new Date()
          },
          $set: {
            userAnswer,
            lastWrongDate: new Date()
          },
          $inc: { wrongCount: 1 },
          $push: {
            reviewHistory: {
              date: new Date(),
              isCorrect: false,
              userAnswer,
              answerTime: 0 // 暂时不计算答题时间
            }
          }
        },
        { upsert: true, new: true }
      );
    }

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    };
  }

  // 获取练习统计信息
  static async getExerciseStats(userId: Types.ObjectId) {
    // 获取用户的练习统计信息
    const stats = await StatsService.getUserStats(userId);
    
    // 获取错题统计
    const wrongQuestionStats = await WrongQuestionModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$subject',
          totalCount: { $sum: 1 },
          averageWrongCount: { $avg: '$wrongCount' }
        }
      }
    ]);

    return {
      ...stats,
      wrongQuestionStats: wrongQuestionStats.map(stat => ({
        subject: stat._id,
        totalCount: stat.totalCount,
        averageWrongCount: Number(stat.averageWrongCount.toFixed(2))
      }))
    };
  }

  // 获取推荐练习题目
  static async getRecommendedQuestions(
    userId: Types.ObjectId,
    limit: number = 10
  ) {
    // 获取用户最近错题的科目和章节分布
    const recentWrongQuestions = await WrongQuestionModel.find(
      { userId },
      { subject: 1, chapterNo: 1 }
    )
      .sort({ lastWrongDate: -1 })
      .limit(20);

    // 统计最频繁出现的科目和章节
    const subjectCount = new Map<string, number>();
    const chapterCount = new Map<number, number>();

    recentWrongQuestions.forEach(q => {
      subjectCount.set(q.subject, (subjectCount.get(q.subject) || 0) + 1);
      chapterCount.set(q.chapterNo, (chapterCount.get(q.chapterNo) || 0) + 1);
    });

    // 获取最常见的科目和章节
    const mostCommonSubject = Array.from(subjectCount.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostCommonChapter = Array.from(chapterCount.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // 基于用户的错题模式推荐题目
    return this.getExerciseQuestions({
      userId,
      subject: mostCommonSubject,
      chapterNo: mostCommonChapter,
      limit,
      excludeAnswered: true
    });
  }
} 