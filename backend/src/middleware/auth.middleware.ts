import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser, User } from '../models/user.model';
import { config } from '../config/config';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/error';

// JWT选项
export const jwtConfig = {
  secret: config.jwtSecret,
  expiresIn: '7d'
};

// 认证中间件
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('未提供认证令牌', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('用户不存在', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('无效的认证令牌', 401));
    } else {
      next(error);
    }
  }
};

// 管理员权限中间件
export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'admin') {
      throw new AppError('需要管理员权限', 403);
    }
    next();
  } catch (error) {
    next(new AppError('需要管理员权限', 403));
  }
}; 