import { Request, Response, NextFunction } from 'express';
import { Order } from '@/modules/orders/models/order.model';
import { Product } from '@/modules/products/models/product.model';
import { User } from '@/modules/users/models/user.model';
import { ApiResponse } from '@/shared/api/ApiResponse';

export class DashboardController {
  /**
   * Get Admin Dashboard Analytics & Overview Metrics
   */
  static async getOverviewStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Aggregate Total Sales & Revenue
      const revenueAggregate = await Order.aggregate([
        { $match: { 'paymentDetails.status': 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 } } },
      ]);

      const totalRevenue = revenueAggregate[0]?.totalRevenue || 0;
      const totalPaidOrders = revenueAggregate[0]?.totalOrders || 0;

      // Total Counts
      const totalProducts = await Product.countDocuments({ isActive: true });
      const totalCustomers = await User.countDocuments({ role: 'customer' });

      // Order Status Breakdown
      const statusBreakdown = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]);

      // Payment Method Breakdown
      const paymentBreakdown = await Order.aggregate([
        { $match: { 'paymentDetails.status': 'paid' } },
        { $group: { _id: '$paymentDetails.method', revenue: { $sum: '$total' }, count: { $sum: 1 } } },
        { $project: { method: '$_id', revenue: 1, count: 1, _id: 0 } },
      ]);

      // Recent 5 Orders
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'firstName lastName email');

      res.status(200).json(
        new ApiResponse(
          200,
          {
            totalRevenue,
            totalPaidOrders,
            totalProducts,
            totalCustomers,
            statusBreakdown,
            paymentBreakdown,
            recentOrders,
          },
          'Dashboard metrics retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
