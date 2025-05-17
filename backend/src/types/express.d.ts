import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface AuthRequest extends Request {
      user?: IUser;
      body: any;
      query: any;
      params: any;
    }
  }
}

export { Request, Response, NextFunction };
export type AuthRequest = Express.AuthRequest; 