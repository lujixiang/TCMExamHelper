import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { WrongQuestion } from '../models/wrong-question.model';
import { Question } from '../models/question.model';
import { IUser } from '../models/user.model';
import { AuthRequest } from '../types/custom';
import { WrongQuestionService } from '../services/wrong-question.service';
import { AppError } from '../utils/error';

export const wrongQuestionController = {
  // 获取错题列表
  getWrongQuestions: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { subject, chapterNo, isResolved, page = 1, limit = 20 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const query: any = { userId };
      if (subject) query.subject = subject;
      if (chapterNo) query.chapterNo = Number(chapterNo);
      if (isResolved !== undefined) query.isResolved = isResolved === 'true';

      console.log('错题查询条件:', query);

      const wrongQuestions = await WrongQuestion.find(query)
        .sort('-lastWrongTime')
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate({
          path: 'questionId',
          model: 'Question',
          select: 'questionId description options answer subject chapterNo'
        })
        .lean();

      console.log('查询到的错题:', JSON.stringify(wrongQuestions, null, 2));

      const total = await WrongQuestion.countDocuments(query);

      // 处理返回数据的格式
      const formattedWrongQuestions = wrongQuestions.map(wq => {
        const question = wq.questionId as any;
        console.log('处理单个错题数据:', {
          wrongQuestion: wq,
          populatedQuestion: question
        });

        if (!question) {
          console.log('题目不存在，错题ID:', wq._id);
          // 如果题目不存在，尝试删除这条错题记录
          WrongQuestion.findByIdAndDelete(wq._id).catch(err => 
            console.error('删除无效错题记录失败:', err)
          );
        }

        return {
          _id: wq._id,
          questionId: question?._id,
          originalQuestionId: question?.questionId,
          subject: question?.subject || wq.subject,
          content: question?.description || '题目不存在',
          options: question?.options || {
            A: '',
            B: '',
            C: '',
            D: ''
          },
          correctAnswer: question?.answer || '',
          wrongCount: wq.wrongCount,
          lastWrongDate: wq.lastWrongDate,
          isResolved: wq.isResolved,
          chapterNo: question?.chapterNo || wq.chapterNo
        };
      });

      // 过滤掉没有关联题目的记录
      const validWrongQuestions = formattedWrongQuestions.filter(wq => 
        wq.content !== '题目不存在'
      );

      console.log('格式化后的错题数据:', JSON.stringify(validWrongQuestions, null, 2));

      res.json({
        success: true,
        data: {
          wrongQuestions: validWrongQuestions,
          pagination: {
            total: validWrongQuestions.length,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(validWrongQuestions.length / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('获取错题列表出错:', error);
      next(error);
    }
  },

  // 获取错题统计
  getWrongQuestionStats: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const stats = await WrongQuestion.aggregate([
        { $match: { userId } },
        { $group: {
          _id: {
            subject: '$subject',
            chapterNo: '$chapterNo'
          },
          totalCount: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: ['$isResolved', 1, 0] }
          },
          unresolvedCount: {
            $sum: { $cond: ['$isResolved', 0, 1] }
          }
        }},
        { $sort: { '_id.subject': 1, '_id.chapterNo': 1 } }
      ]);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  // 删除错题记录
  deleteWrongQuestion: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { questionId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      console.log('删除错题记录:', { userId, questionId });

      const wrongQuestion = await WrongQuestion.findOne({
        userId,
        $or: [
          { _id: questionId },
          { questionId: questionId }
        ]
      });

      if (!wrongQuestion) {
        return res.status(404).json({
          success: false,
          message: '错题记录不存在'
        });
      }

      await wrongQuestion.deleteOne();

      res.json({
        success: true,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除错题记录出错:', error);
      next(error);
    }
  },

  // 批量删除错题记录
  batchDeleteWrongQuestions: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { questionIds } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的题目ID列表'
        });
      }

      console.log('批量删除错题记录:', { userId, questionIds });

      const result = await WrongQuestion.deleteMany({
        userId,
        $or: [
          { _id: { $in: questionIds } },
          { questionId: { $in: questionIds } }
        ]
      });

      res.json({
        success: true,
        message: `成功删除${result.deletedCount}条记录`
      });
    } catch (error) {
      console.error('批量删除错题记录出错:', error);
      next(error);
    }
  },

  // 更新错题状态
  updateStatus: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { questionId } = req.params;
      const { isResolved } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const wrongQuestion = await WrongQuestion.findOneAndUpdate(
        { userId, questionId },
        { isResolved },
        { new: true }
      );

      if (!wrongQuestion) {
        return res.status(404).json({
          success: false,
          message: '错题记录不存在'
        });
      }

      res.json({
        success: true,
        data: wrongQuestion
      });
    } catch (error) {
      next(error);
    }
  },

  // 批量更新错题状态
  batchUpdateStatus: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { questionIds, isResolved } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的题目ID列表'
        });
      }

      await WrongQuestion.updateMany(
        {
          userId,
          questionId: { $in: questionIds.map(id => new mongoose.Types.ObjectId(id)) }
        },
        {
          $set: { isResolved }
        }
      );

      res.json({
        success: true,
        message: '批量更新成功'
      });
    } catch (error) {
      next(error);
    }
  },

  // 清空错题记录
  clearWrongQuestions: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const { subject } = req.query;
      await WrongQuestionService.clearAllWrongQuestions(userId, subject as string);
      
      res.json({
        success: true,
        message: subject ? `${subject}科目的错题记录已清空` : '所有错题记录已清空'
      });
    } catch (error) {
      next(error);
    }
  },

  // 获取高频错题
  getFrequentWrongQuestions: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const { limit } = req.query;
      const questions = await WrongQuestionService.getFrequentWrongQuestions(
        userId,
        limit ? Number(limit) : 10
      );
      
      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  },

  // 获取最近错题
  getRecentWrongQuestions: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const { limit } = req.query;
      const questions = await WrongQuestionService.getRecentWrongQuestions(
        userId,
        limit ? Number(limit) : 10
      );
      
      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  },

  // 获取错题详情
  getWrongQuestionById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const question = await WrongQuestion.findOne({ _id: id, userId });
      if (!question) {
        throw new AppError('错题不存在', 404);
      }

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      next(error);
    }
  },

  // 更新错题状态
  updateWrongQuestion: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { status, isResolved } = req.body;

      const question = await WrongQuestion.findOneAndUpdate(
        { _id: id, userId },
        {
          $set: {
            status,
            isResolved,
            resolvedDate: isResolved ? new Date() : undefined
          }
        },
        { new: true }
      );

      if (!question) {
        throw new AppError('错题不存在', 404);
      }

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      next(error);
    }
  }
}; 