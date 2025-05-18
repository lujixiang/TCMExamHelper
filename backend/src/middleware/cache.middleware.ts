import { Request, Response, NextFunction } from 'express';

/**
 * 中间件：为特定路径设置缓存控制头
 * 用于避免浏览器缓存API响应
 */
export const noCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 设置禁止缓存的头部
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate', 
    'Pragma': 'no-cache', 
    'Expires': '0'
  });
  next();
}; 