import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { AuthRequest } from '../types/custom';
import { config } from '../config/config';
import { AppError } from '../utils/error';
import bcrypt from 'bcryptjs';

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
    lastLoginAt?: Date;
    lastAnswerAt?: Date;
  };
}

// 格式化用户响应
const formatUserResponse = (user: IUser): UserResponse => ({
  _id: user._id.toString(),
  username: user.username,
  email: user.email,
  role: user.role,
  profile: user.profile,
  stats: {
    totalQuestions: user.stats.totalQuestions,
    correctCount: user.stats.correctCount,
    wrongCount: user.stats.wrongCount,
    streak: user.stats.streak,
    lastLoginAt: user.stats.lastLoginAt,
    lastAnswerAt: user.stats.lastAnswerAt
  }
});

// 生成token的辅助函数，将config.jwtExpiresIn转换为数字类型
const getJwtExpiresIn = (): number => {
  const expiresIn = config.jwtExpiresIn;
  if (typeof expiresIn === 'number') {
    return expiresIn;
  }
  
  // 解析字符串格式的过期时间，如 "7d", "24h", "60m" 等
  const matchDays = expiresIn.match(/^(\d+)d$/);
  if (matchDays) {
    return parseInt(matchDays[1]) * 24 * 60 * 60; // 转换为秒
  }
  
  const matchHours = expiresIn.match(/^(\d+)h$/);
  if (matchHours) {
    return parseInt(matchHours[1]) * 60 * 60; // 转换为秒
  }
  
  const matchMinutes = expiresIn.match(/^(\d+)m$/);
  if (matchMinutes) {
    return parseInt(matchMinutes[1]) * 60; // 转换为秒
  }
  
  const matchSeconds = expiresIn.match(/^(\d+)s$/);
  if (matchSeconds) {
    return parseInt(matchSeconds[1]); // 秒
  }
  
  // 默认为7天
  return 7 * 24 * 60 * 60;
};

class AuthController {
  // 用户注册
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;

      // 检查用户是否已存在
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        throw new AppError('用户名或邮箱已存在', 400);
      }

      // 创建新用户
      const user = await User.create({
        username,
        email,
        password,
        name: username // 默认使用用户名作为姓名
      });

      // 生成 JWT
      const token = jwt.sign(
        { id: user._id.toString() },
        config.jwtSecret,
        { expiresIn: getJwtExpiresIn() }
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
  }

  // 用户登录
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // 查找用户
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new AppError('用户不存在', 401);
      }

      // 验证密码
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AppError('密码错误', 401);
      }

      // 生成 JWT
      const token = jwt.sign(
        { id: user._id.toString() },
        config.jwtSecret,
        { expiresIn: getJwtExpiresIn() }
      );

      res.json({
        success: true,
        data: {
          token,
          user: formatUserResponse(user)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 刷新令牌
  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError('未提供刷新令牌', 400);
      }

      const decoded = jwt.verify(refreshToken, config.jwtSecret) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError('用户不存在', 401);
      }

      const token = jwt.sign(
        { id: user._id.toString() },
        config.jwtSecret,
        { expiresIn: getJwtExpiresIn() }
      );

      res.json({
        success: true,
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }

  // 修改密码
  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?._id;

      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new AppError('用户不存在', 401);
      }

      // 验证当前密码
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new AppError('当前密码错误', 401);
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

  // 重置密码请求
  async resetPasswordRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      // TODO: 发送重置密码邮件
      
      res.json({
        success: true,
        message: '重置密码链接已发送到您的邮箱'
      });
    } catch (error) {
      next(error);
    }
  }

  // 重置密码
  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError('无效的重置令牌', 400);
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: '密码重置成功'
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取当前用户信息
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
          user: formatUserResponse(user)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新用户资料
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'profile.nickname': req.body.nickname,
            'profile.avatar': req.body.avatar
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
          user: formatUserResponse(user)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

// 获取当前用户信息
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new AppError('用户不存在', 404);
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
};

// 更新用户资料
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      {
        $set: {
          'profile.nickname': req.body.nickname,
          'profile.avatar': req.body.avatar
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
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    next(error);
  }
}; 