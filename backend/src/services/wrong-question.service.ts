import { Types } from 'mongoose';
import { WrongQuestionModel } from '../models/wrong-question.model';
import { QuestionModel } from '../models/question.model';
import { StatsService } from './stats.service';

export class WrongQuestionService {
  // 添加或更新错题记录
  static async addOrUpdateWrongQuestion(
    userId: Types.ObjectId,
    questionId: Types.ObjectId,
    wrongAnswer: string
  ): Promise<void> {
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      throw new Error('题目不存在');
    }

    const existingRecord = await WrongQuestionModel.findOne({
      userId,
      questionId
    });

    if (existingRecord) {
      // 更新已存在的错题记录
      await WrongQuestionModel.findByIdAndUpdate(existingRecord._id, {
        $inc: { attemptCount: 1 },
        wrongAnswer,
        lastAttemptDate: new Date()
      });
    } else {
      // 创建新的错题记录
      await WrongQuestionModel.create({
        userId,
        questionId,
        subject: question.subject,
        chapterNo: question.chapterNo,
        wrongAnswer,
        attemptCount: 1,
        lastAttemptDate: new Date()
      });
    }

    // 更新用户统计信息
    await StatsService.updateQuestionStats(userId, false);
  }

  // 获取用户的错题列表
  static async getWrongQuestions(
    userId: Types.ObjectId,
    options: {
      subject?: string;
      chapterNo?: number;
      sortBy?: 'lastAttemptDate' | 'attemptCount';
      order?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {}
  ) {
    const {
      subject,
      chapterNo,
      sortBy = 'lastAttemptDate',
      order = 'desc',
      page = 1,
      limit = 10
    } = options;

    // 构建查询条件
    const query: any = { userId };
    if (subject) query.subject = subject;
    if (chapterNo) query.chapterNo = chapterNo;

    // 计算总数
    const total = await WrongQuestionModel.countDocuments(query);

    // 获取错题记录
    const wrongQuestions = await WrongQuestionModel.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('questionId');

    return {
      total,
      page,
      limit,
      data: wrongQuestions.map(record => ({
        ...record.toObject(),
        question: record.questionId
      }))
    };
  }

  // 获取错题统计信息
  static async getWrongQuestionStats(userId: Types.ObjectId) {
    const stats = await WrongQuestionModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          avgAttempts: { $avg: '$attemptCount' }
        }
      }
    ]);

    return stats.map(stat => ({
      subject: stat._id,
      count: stat.count,
      avgAttempts: Number(stat.avgAttempts.toFixed(2))
    }));
  }

  // 删除错题记录
  static async removeWrongQuestion(
    userId: Types.ObjectId,
    questionId: Types.ObjectId
  ): Promise<void> {
    const result = await WrongQuestionModel.deleteOne({
      userId,
      questionId
    });

    if (result.deletedCount === 0) {
      throw new Error('错题记录不存在');
    }
  }

  // 清空用户的所有错题记录
  static async clearAllWrongQuestions(
    userId: Types.ObjectId,
    subject?: string
  ): Promise<void> {
    const query: any = { userId };
    if (subject) query.subject = subject;

    await WrongQuestionModel.deleteMany(query);
  }

  // 获取高频错题
  static async getFrequentWrongQuestions(
    userId: Types.ObjectId,
    limit: number = 10
  ) {
    return WrongQuestionModel.find({ userId })
      .sort({ attemptCount: -1 })
      .limit(limit)
      .populate('questionId');
  }

  // 获取最近的错题
  static async getRecentWrongQuestions(
    userId: Types.ObjectId,
    limit: number = 10
  ) {
    return WrongQuestionModel.find({ userId })
      .sort({ lastAttemptDate: -1 })
      .limit(limit)
      .populate('questionId');
  }
} 