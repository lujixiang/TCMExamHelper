import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { StatsService } from '../services/stats.service';

export const statsController = {
  // 获取用户统计信息
  getUserStats: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const stats = await StatsService.getUserStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  // 获取每日答题状态
  getDailyStatus: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const dailyStatus = await StatsService.getDailyStatus(userId);
      
      res.json({
        success: true,
        data: dailyStatus
      });
    } catch (error) {
      next(error);
    }
  },

  // 重置用户统计
  resetStats: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      await StatsService.resetStats(userId);
      
      res.json({
        success: true,
        message: '统计数据已重置'
      });
    } catch (error) {
      next(error);
    }
  }
}; 