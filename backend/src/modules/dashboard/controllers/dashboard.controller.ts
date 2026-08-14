import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '@/shared/api/ApiResponse';

const dashboardService = new DashboardService();

export class DashboardController {
  /**
   * Get Admin Dashboard Analytics & Overview Metrics
   */
  static async getOverviewStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getOverviewStats();
      res.status(200).json(
        new ApiResponse(
          200,
          stats,
          'Dashboard metrics retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
