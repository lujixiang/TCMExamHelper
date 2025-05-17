import { Types } from 'mongoose';
import { Question } from '../models/question.model';
import { WrongQuestion } from '../models/wrong-question.model';
import { Chapter } from '../models/chapter.model';

export class PracticeService {
  // 获取科目的所有章节
  static async getChapters(subject: string) {
    return await Chapter.find({ subject }).sort('chapterNo');
  }

  // 获取章节的题目
  static async getChapterQuestions(subject: string, chapterNo: number, page: number = 1, limit: number = 20) {
    const questions = await Question.find({ subject, chapterNo: Number(chapterNo) })
      .sort('questionNo')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Question.countDocuments({ subject, chapterNo: Number(chapterNo) });

    return {
      questions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 获取每日练习题目
  static async getDailyQuestions() {
    return await Question.aggregate([
      { $sample: { size: 30 } }
    ]);
  }

  // 获取专项练习题目
  static async getTopicQuestions(subject: string, count: number = 20, difficulty?: number) {
    const query: any = { subject: decodeURIComponent(subject) };
    if (difficulty) {
      query.difficulty = Number(difficulty);
    }

    return await Question.aggregate([
      { $match: query },
      { $sample: { size: Number(count) } }
    ]);
  }

  // 获取模拟考试题目
  static async getExamQuestions() {
    return await Question.aggregate([
      { $sample: { size: 100 } }
    ]);
  }

  // 获取强化训练题目
  static async getEnhanceQuestions(userId: Types.ObjectId) {
    return await WrongQuestion.find({ 
      userId,
      isResolved: false
    })
      .sort('-wrongCount')
      .limit(20)
      .populate('questionId');
  }

  // 获取智能推荐题目
  static async getRecommendedQuestions(userId: Types.ObjectId) {
    const wrongStats = await WrongQuestion.aggregate([
      { $match: { userId } },
      { 
        $group: {
          _id: '$chapterNo',
          wrongCount: { $sum: 1 }
        }
      }
    ]);

    const recommendations = await Promise.all(
      wrongStats.map(async (stat: { _id: number; wrongCount: number }) => {
        return await Question.find({
          chapterNo: stat._id,
          difficulty: { $gte: 3 }
        })
        .limit(Math.ceil(stat.wrongCount * 0.3))
        .select('-correctAnswer -explanation');
      })
    );

    return recommendations.flat();
  }

  // 提交答案
  static async submitAnswer(userId: Types.ObjectId, questionId: string, answer: string) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error('题目不存在');
    }

    const isCorrect = question.answer === answer;

    if (!isCorrect) {
      const existingWrongQuestion = await WrongQuestion.findOne({
        userId,
        questionId: new Types.ObjectId(questionId)
      });

      if (existingWrongQuestion) {
        await WrongQuestion.findByIdAndUpdate(existingWrongQuestion._id, {
          $inc: { wrongCount: 1 },
          lastWrongTime: new Date(),
          isResolved: false
        });
      } else {
        await WrongQuestion.create({
          userId,
          questionId: new Types.ObjectId(questionId),
          subject: question.subject,
          chapterNo: question.chapterNo || 0,
          wrongCount: 1,
          lastWrongTime: new Date(),
          isResolved: false
        });
      }
    }

    return {
      isCorrect,
      correctAnswer: question.answer,
      explanation: question.explanation
    };
  }

  // 获取练习统计
  static async getExerciseStats(userId: Types.ObjectId) {
    const totalQuestions = await Question.countDocuments();
    const completedQuestions = await WrongQuestion.distinct('questionId', { userId });
    const wrongQuestions = await WrongQuestion.find({ userId, isResolved: false });

    return {
      totalQuestions,
      completedCount: completedQuestions.length,
      wrongCount: wrongQuestions.length,
      accuracy: completedQuestions.length ? 
        ((completedQuestions.length - wrongQuestions.length) / completedQuestions.length * 100).toFixed(2) : 
        0
    };
  }
} 