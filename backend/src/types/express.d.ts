import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    // 扩展 Request 接口
    interface Request {
      user?: IUser;
    }
  }
}

// 导出自定义的请求类型
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  } & JwtPayload;
  header(name: string): string | undefined;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error?: any;
}

export { Request, Response, NextFunction }; 