import { Request } from 'express';
import { IUser } from '../models/user.model';

// 导出自定义的请求类型
export interface AuthRequest extends Request {
  user?: IUser;
  body: any;
  params: any;
  query: any;
  headers: {
    authorization?: string;
    [key: string]: string | undefined;
  };
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error?: any;
} 