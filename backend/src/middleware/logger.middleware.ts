import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // 请求完成后记录日志
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      query: req.query,
      params: req.params,
      body: req.method !== 'GET' ? req.body : undefined,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };

    // 根据状态码决定日志级别
    if (res.statusCode >= 500) {
      console.error('请求错误:', log);
    } else if (res.statusCode >= 400) {
      console.warn('请求警告:', log);
    } else {
      console.log('请求信息:', log);
    }
  });

  next();
}; 