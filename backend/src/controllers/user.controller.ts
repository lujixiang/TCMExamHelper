import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/user.model';
import { WrongQuestion } from '../models/wrong-question.model';

interface AuthRequest extends Request {
  user?: IUser;
}

class UserController {
  // 更新用户资料
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const { nickname, avatar } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          'profile.nickname': nickname,
          'profile.avatar': avatar
        },
        { new: true, select: '-password' }
      );

      res.json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新密码
  async updatePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      // 验证当前密码
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: '当前密码错误'
        });
      }

      // 更新密码
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: '密码更新成功'
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取学习统计
  async getStudyStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: user.stats
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取学习统计详情
  async getStudyStatsDetail(req: AuthRequest, res: Response, next: NextFunction) {
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
          totalWrong: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: ['$isResolved', 1, 0] }
          }
        }},
        { $group: {
          _id: '$_id.subject',
          chapters: {
            $push: {
              chapterNo: '$_id.chapterNo',
              totalWrong: '$totalWrong',
              resolvedCount: '$resolvedCount'
            }
          },
          totalWrong: { $sum: '$totalWrong' },
          totalResolved: { $sum: '$resolvedCount' }
        }}
      ]);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新学习进度
  async updateStudyProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const { subject, chapterNo, completedQuestions } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            [`studyProgress.${subject}.${chapterNo}`]: {
              completedQuestions,
              lastStudyTime: new Date()
            }
          }
        },
        { new: true }
      );

      res.json({
        success: true,
        data: user?.studyProgress
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取学习进度
  async getStudyProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const { subject } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const progress = subject ? user.studyProgress?.get(subject) : user.studyProgress;

      res.json({
        success: true,
        data: progress || {}
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController(); 