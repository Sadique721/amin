import { Order } from '@/modules/orders/models/order.model';
import { Product } from '@/modules/products/models/product.model';
import { User } from '@/modules/users/models/user.model';

export interface DashboardMetrics {
  totalRevenue: number;
  totalPaidOrders: number;
  totalProducts: number;
  totalCustomers: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  paymentBreakdown: Array<{ method: string; revenue: number; count: number }>;
  recentOrders: any[];
}

export class DashboardService {
  async getOverviewStats(): Promise<DashboardMetrics> {
    const revenueAggregate = await Order.aggregate([
      { $match: { 'paymentDetails.status': 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 } } },
    ]);

    const totalRevenue = revenueAggregate[0]?.totalRevenue || 0;
    const totalPaidOrders = revenueAggregate[0]?.totalOrders || 0;

    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    const paymentBreakdown = await Order.aggregate([
      { $match: { 'paymentDetails.status': 'paid' } },
      { $group: { _id: '$paymentDetails.method', revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $project: { method: '$_id', revenue: 1, count: 1, _id: 0 } },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName email');

    return {
      totalRevenue,
      totalPaidOrders,
      totalProducts,
      totalCustomers,
      statusBreakdown,
      paymentBreakdown,
      recentOrders,
    };
  }
}
