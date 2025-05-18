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
export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('未提供认证令牌', 401);
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded as any;
    next();
  } catch (error) {
    next(new AppError('无效的认证令牌', 401));
  }
};

// 管理员权限中间件
export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
}; 