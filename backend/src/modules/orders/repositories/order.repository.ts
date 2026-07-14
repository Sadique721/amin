import { Order, IOrder } from '../models/order.model';

export class OrderRepository {
  async create(data: Partial<IOrder>): Promise<IOrder> {
    return await Order.create(data);
  }

  async findById(id: string): Promise<IOrder | null> {
    return await Order.findById(id).populate('user', 'name email').populate('items.product');
  }

  async findByRazorpayOrderId(rzpOrderId: string): Promise<IOrder | null> {
    return await Order.findOne({ 'paymentDetails.razorpayOrderId': rzpOrderId });
  }

  async update(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    return await Order.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async list(filter: any = {}, options: any = {}): Promise<any> {
    return await Order.paginate(filter, options);
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return await Order.aggregate(pipeline);
  }
}
