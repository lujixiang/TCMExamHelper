import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Question } from '../models/question.model';
import { Chapter } from '../models/chapter.model';
import { WrongQuestion } from '../models/wrong-question.model';
import { IUser } from '../models/user.model';

interface AuthRequest extends Request {
  user?: IUser;
}

interface WrongStat {
  _id: number;
  wrongCount: number;
}

// 内联定义 IWrongQuestion 接口
interface IWrongQuestion {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
  subject: string;
  chapterNo: number;
  wrongCount: number;
  lastWrongTime: Date;
  isResolved: boolean;
}

class PracticeController {
  // 获取科目的所有章节
  async getChapters(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject } = req.params;
      const chapters = await Chapter.find({ subject }).sort('chapterNo');
      
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
      
      const questions = await Question.find({ 
        subject, 
        chapterNo: Number(chapterNo) 
      })
      .sort('questionNo')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

      const total = await Question.countDocuments({ subject, chapterNo: Number(chapterNo) });

      res.json({
        success: true,
        data: {
          questions,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取每日练习题目
  async getDailyQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // 随机获取30道题目
      const questions = await Question.aggregate([
        { $sample: { size: 30 } }
      ]);

      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取专项练习题目（添加分页和难度筛选）
  async getTopicQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject } = req.params;
      const { count = 20, difficulty } = req.query;

      console.log('获取专项练习题目 - 参数:', {
        subject: subject,
        decodedSubject: decodeURIComponent(subject),
        count: count,
        difficulty: difficulty
      });

      const query: any = { subject: decodeURIComponent(subject) };
      if (difficulty) {
        query.difficulty = Number(difficulty);
      }

      console.log('MongoDB查询条件:', query);

      // 使用聚合管道随机获取指定数量的题目
      const questions = await Question.aggregate([
        { $match: query },
        { $sample: { size: Number(count) } }
      ]);

      console.log('查询结果:', {
        count: questions.length,
        sample: questions.length > 0 ? questions[0] : null
      });

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
      console.error('获取专项练习题目出错:', error);
      next(error);
    }
  }

  // 获取模拟考试题目
  async getExamQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // 随机获取100道题目作为模拟考试
      const questions = await Question.aggregate([
        { $sample: { size: 100 } }
      ]);

      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取强化训练题目（优化错题推荐）
  async getEnhanceQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      // 获取用户错误率较高的题目
      const wrongQuestions = await WrongQuestion.find({ 
        userId,
        isResolved: false
      })
        .sort('-wrongCount')
        .limit(20)
        .populate('questionId');

      const questions = wrongQuestions.map((wq: IWrongQuestion) => wq.questionId);

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

      // 获取用户的错题统计
      const wrongStats = await WrongQuestion.aggregate([
        { $match: { userId } },
        { $group: {
          _id: '$chapterNo',
          wrongCount: { $sum: 1 }
        }}
      ]);

      // 根据错题分布推荐题目
      const recommendations = await Promise.all(
        wrongStats.map(async (stat: WrongStat) => {
          const questions = await Question.find({
            chapterNo: stat._id,
            difficulty: { $gte: 3 }  // 优先选择难度较大的题目
          })
          .limit(Math.ceil(stat.wrongCount * 0.3))  // 按错题数量比例推荐
          .select('-correctAnswer -explanation');
          
          return questions;
        })
      );

      res.json({
        success: true,
        data: recommendations.flat()
      });
    } catch (error) {
      next(error);
    }
  }

  // 提交答案
  async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const { questionId, answer, isCorrect } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      // 获取题目信息
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: '题目不存在'
        });
      }

      console.log('提交答案:', {
        userId,
        questionId,
        answer,
        isCorrect,
        question: {
          _id: question._id,
          subject: question.subject,
          chapterNo: question.chapterNo
        }
      });

      // 如果答错了，记录到错题本
      if (!isCorrect) {
        const existingWrongQuestion = await WrongQuestion.findOne({
          userId,
          questionId: new Types.ObjectId(questionId)
        });

        console.log('查找已存在的错题记录:', existingWrongQuestion);

        if (existingWrongQuestion) {
          // 更新已存在的错题记录
          await WrongQuestion.findByIdAndUpdate(existingWrongQuestion._id, {
            $inc: { wrongCount: 1 },
            lastWrongTime: new Date(),
            isResolved: false
          });

          console.log('更新错题记录成功');
        } else {
          // 创建新的错题记录
          const newWrongQuestion = await WrongQuestion.create({
            userId,
            questionId: new Types.ObjectId(questionId),
            subject: question.subject,
            chapterNo: question.chapterNo || 0, // 提供默认值
            wrongCount: 1,
            lastWrongTime: new Date(),
            isResolved: false
          });

          console.log('创建新错题记录成功:', newWrongQuestion);
        }
      }

      res.json({
        success: true,
        message: '提交成功',
        data: {
          isCorrect,
          correctAnswer: question.answer,
          explanation: question.explanation
        }
      });
    } catch (error) {
      console.error('提交答案出错:', error);
      next(error);
    }
  }
}

export const practiceController = new PracticeController(); 