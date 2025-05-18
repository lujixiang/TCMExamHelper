import express from 'express';
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction, Router, Express as ExpressApp } from 'express';
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
export interface AuthRequest extends ExpressRequest {
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

export type Request = ExpressRequest;
export type Response = ExpressResponse;
export type NextFunction = ExpressNextFunction;
export type Express = ExpressApp;
export { Router };
export default express; 