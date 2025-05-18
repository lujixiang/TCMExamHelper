import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { AuthRequest } from '../types/custom';
import { AppError } from '../utils/error';

class UserController {
  // 注册新用户
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, email, password, name } = req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        throw new AppError('用户名或邮箱已被使用', 400);
      }

      const user = await User.create({
        username,
        email,
        password,
        name
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 用户登录
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new AppError('用户不存在', 401);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AppError('密码错误', 401);
      }

      // 更新最后登录时间
      user.lastLoginAt = new Date();
      await user.save();

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取当前登录用户信息
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新用户资料
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { nickname, avatar } = req.body;
      const userId = req.user?._id;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'profile.nickname': nickname,
            'profile.avatar': avatar
          }
        },
        { new: true }
      );

      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 修改密码
  async updatePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?._id;

      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new AppError('当前密码错误', 401);
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: '密码修改成功'
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取用户详情
  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取学习统计
  async getStudyStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      res.json({
        success: true,
        data: {
          stats: {
            totalQuestions: user.stats.totalQuestions,
            correctCount: user.stats.correctCount,
            wrongCount: user.stats.wrongCount,
            streak: user.stats.streak || 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取学习统计详情
  async getStudyStatsDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      // TODO: 实现详细统计数据查询
      res.json({
        success: true,
        data: {
          stats: {
            // 详细统计数据
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新学习进度
  async updateStudyProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject, chapterNo, completedQuestions } = req.body;
      const userId = req.user?._id;
      
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      // 初始化进度数据结构
      if (!user.studyProgress) {
        user.studyProgress = new Map();
      }

      if (!user.studyProgress.has(subject)) {
        user.studyProgress.set(subject, new Map());
      }

      const subjectProgress = user.studyProgress.get(subject);
      if (!subjectProgress) return;

      if (!subjectProgress.has(chapterNo)) {
        subjectProgress.set(chapterNo, {
          completedQuestions: [],
          lastStudyTime: new Date()
        });
      }

      const chapterProgress = subjectProgress.get(chapterNo);
      if (!chapterProgress) return;

      // 更新完成的题目和学习时间
      chapterProgress.completedQuestions = [
        ...new Set([...chapterProgress.completedQuestions, ...completedQuestions])
      ];
      chapterProgress.lastStudyTime = new Date();

      await user.save();

      res.json({
        success: true,
        message: '学习进度已更新'
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取学习进度
  async getStudyProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subject } = req.params;
      const userId = req.user?._id;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      if (!user.studyProgress) {
        return res.json({
          success: true,
          data: {
            progress: {}
          }
        });
      }

      if (subject) {
        const subjectProgress = user.studyProgress.get(subject);
        if (!subjectProgress) {
          return res.json({
            success: true,
            data: {
              progress: {}
            }
          });
        }

        const formattedProgress: Record<string, any> = {};
        subjectProgress.forEach((value, key) => {
          formattedProgress[key] = value;
        });

        return res.json({
          success: true,
          data: {
            progress: formattedProgress
          }
        });
      }

      // 返回所有科目的学习进度
      const formattedProgress: Record<string, any> = {};
      user.studyProgress.forEach((subjectMap, subjectKey) => {
        const subjectProgress: Record<string, any> = {};
        subjectMap.forEach((value, key) => {
          subjectProgress[key] = value;
        });
        formattedProgress[subjectKey] = subjectProgress;
      });

      res.json({
        success: true,
        data: {
          progress: formattedProgress
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController(); 