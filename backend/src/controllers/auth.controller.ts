import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser, User } from '../models/user.model';
import { AuthRequest, jwtConfig } from '../middleware/auth.middleware';
import { Types } from 'mongoose';

// 用户响应接口
interface UserResponse {
  _id: string;
  username: string;
  email: string;
  role: string;
  profile?: {
    nickname?: string;
    avatar?: string;
  };
  stats?: {
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    streak: number;
    lastLoginDate?: Date;
  };
}

// 格式化用户响应
const formatUserResponse = (user: IUser): UserResponse => ({
  _id: (user._id as Types.ObjectId).toString(),
  username: user.username,
  email: user.email,
  role: user.role,
  profile: user.profile,
  stats: {
    totalQuestions: user.stats.totalQuestions,
    correctCount: user.stats.correctCount,
    wrongCount: user.stats.wrongCount,
    streak: user.stats.streak,
    lastLoginDate: user.stats.lastLoginDate
  }
});

export const authController = {
  // 用户注册
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;

      // 检查用户是否已存在
      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名或邮箱已被注册'
        });
      }

      // 创建新用户
      const user = new User({
        username,
        email,
        password
      });

      await user.save();

      // 生成token
      const token = jwt.sign(
        { _id: user._id.toString() },
        jwtConfig.secret,
        jwtConfig.options
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: formatUserResponse(user)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 用户登录
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      // 输入验证
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '请提供用户名和密码'
        });
      }

      // 查找用户
      const user = await User.findOne({
        $or: [
          { username },
          { email: username } // 支持使用邮箱登录
        ]
      }).select('+password'); // 确保包含密码字段

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      console.log('Found user:', {
        id: user._id,
        username: user.username,
        hasPassword: !!user.password
      });

      // 验证密码
      const isMatch = await user.comparePassword(password);
      console.log('Password match result:', isMatch);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 更新最后登录时间
      user.stats.lastLoginDate = new Date();
      await user.save();

      // 生成token
      const token = jwt.sign(
        { _id: user._id.toString() },
        jwtConfig.secret,
        jwtConfig.options
      );

      // 移除密码字段
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        data: {
          token,
          user: formatUserResponse(userResponse)
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  },

  // 获取当前用户信息
  getCurrentUser: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: {
          user: formatUserResponse(user)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 更新用户信息
  updateProfile: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { nickname, avatar } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          'profile.nickname': nickname,
          'profile.avatar': avatar
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: {
          user: formatUserResponse(user)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 修改密码
  changePassword: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user?._id).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证当前密码
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: '当前密码错误'
        });
      }

      // 更新密码
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
}; 