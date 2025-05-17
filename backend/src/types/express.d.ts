import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model';

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
  user?: IUser;
  header(name: string): string | undefined;
}

export { Request, Response, NextFunction }; 