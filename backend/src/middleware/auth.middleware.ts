import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { IUser, User } from '../models/user.model';

// JWT配置
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'tcm_exam_helper_secret_key_2024_secure_random_string_xyz_123';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// JWT选项
export const jwtOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
};

// 用户请求接口
export interface AuthRequest extends Request {
  user?: IUser;
}

// JWT载荷接口
interface JWTPayload extends JwtPayload {
  _id: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('未提供认证令牌');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error('用户不存在');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: error.message || '请先登录'
      });
    } else {
      res.status(401).json({
        success: false,
        message: '认证失败'
      });
    }
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

// 导出JWT配置供其他模块使用
export const jwtConfig = {
  secret: JWT_SECRET,
  expiresIn: JWT_EXPIRES_IN,
  options: jwtOptions
}; 