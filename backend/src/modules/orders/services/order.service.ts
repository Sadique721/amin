import { OrderRepository } from '../repositories/order.repository';
import { IOrder, IOrderItem } from '../models/order.model';
import { Product } from '@/modules/products/models/product.model';
import { CouponService } from '@/modules/coupons/services/coupon.service';
import { BadRequestException, NotFoundException, ForbiddenException, InternalServerException } from '@/shared/exceptions';
import { env } from '@/config/env';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '@/shared/logger';

export class OrderService {
  private repository = new OrderRepository();
  private couponService = new CouponService();
  
  private razorpay = env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      })
    : null;

  async createOrder(
    userId: string,
    itemsInput: { productId: string; sku: string; quantity: number }[],
    shippingAddress: any,
    couponCode?: string,
    paymentMethod: 'razorpay' | 'cod' | 'authorize_net' | 'card' = 'cod',
    paymentDetailsInput?: any
  ): Promise<IOrder> {
    
    let subtotal = 0;
    const items: IOrderItem[] = [];

    for (const input of itemsInput) {
      const product = await Product.findById(input.productId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${input.productId} not found`);
      }

      const variant = product.variants.find((v) => v.sku === input.sku);
      if (!variant) {
        throw new NotFoundException(`Variant SKU ${input.sku} not found for product ${product.name}`);
      }

      if (variant.stock < input.quantity) {
        throw new BadRequestException(`Not enough stock for ${product.name} (${input.sku}). Available: ${variant.stock}`);
      }

      subtotal += variant.price * input.quantity;
      items.push({
        product: product._id as any,
        variant: {
          sku: variant.sku,
          price: variant.price,
          attributes: variant.attributes instanceof Map ? Object.fromEntries((variant.attributes as any).entries()) : (variant.attributes as any),
        },
        quantity: input.quantity,
      });
    }

    let discount = 0;
    let couponId: any = undefined;

    if (couponCode) {
      const validation = await this.couponService.validateCoupon(couponCode, subtotal);
      discount = validation.discountAmount;
      couponId = validation.coupon._id;
    }

    const total = Math.max(0, subtotal - discount);
    
    const isCardPayment = paymentMethod === 'authorize_net' || paymentMethod === 'card';
    const rawCardNum = paymentDetailsInput?.cardNumber || '';
    const last4 = paymentDetailsInput?.cardLast4 || (rawCardNum ? rawCardNum.slice(-4) : '1111');

    const paymentDetails: any = {
      method: paymentMethod,
      status: isCardPayment ? 'paid' : 'pending',
      transactionId: isCardPayment ? `auth_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` : undefined,
      cardholderName: paymentDetailsInput?.cardholderName || shippingAddress?.fullName || 'Cardholder',
      cardLast4: isCardPayment ? last4 : undefined,
    };

    if (paymentMethod === 'razorpay' && total > 0) {
      if (this.razorpay) {
        try {
          const rzpOrder = await this.razorpay.orders.create({
            amount: total * 100,
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
          });
          paymentDetails.razorpayOrderId = rzpOrder.id;
        } catch (error: any) {
          logger.error('Razorpay order creation failed:', error);
          throw new BadRequestException(error.message || 'Razorpay order creation failed');
        }
      } else {
        logger.warn('Razorpay keys missing. Initializing mock order id.');
        paymentDetails.razorpayOrderId = `rzp_mock_${Math.random().toString(36).substring(2, 9)}`;
      }
    }

    const order = await this.repository.create({
      user: userId as any,
      items,
      shippingAddress,
      paymentDetails,
      coupon: couponId,
      subtotal,
      discount,
      deliveryFee: 0,
      total,
      status: isCardPayment ? 'processing' : 'pending',
    });

    if (isCardPayment) {
      await this.deductInventory(items);
      if (couponCode) {
        try {
          await this.couponService.incrementUsage(couponCode);
        } catch (e) {}
      }
    }

    return order;
  }

  async verifyRazorpayPayment(
    userId: string,
    userRole: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<IOrder> {
    const order = await this.repository.findByRazorpayOrderId(razorpayOrderId);
    if (!order) {
      throw new NotFoundException('Order not found with this Razorpay order ID');
    }

    if (userRole !== 'admin' && order.user.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to access this order');
    }

    if (order.paymentDetails.status === 'paid') {
      return order;
    }

    if (this.razorpay && env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        order.paymentDetails.status = 'failed';
        await order.save();
        throw new BadRequestException('Invalid payment signature');
      }
    } else {
      if (env.NODE_ENV === 'production') {
        throw new InternalServerException('Razorpay credentials missing in production environment');
      }
      logger.warn('Razorpay credentials missing. Bypassing signature verification (Mock Mode).');
    }

    order.paymentDetails.status = 'paid';
    order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
    order.paymentDetails.razorpaySignature = razorpaySignature;
    order.status = 'processing';
    await order.save();

    await this.deductInventory(order.items);

    if (order.coupon) {
      const coupon = await this.couponService.getCouponById(order.coupon.toString());
      if (coupon) {
        await this.couponService.incrementUsage(coupon.code);
      }
    }

    return order;
  }

  async verifyCodPayment(userId: string, userRole: string, orderId: string): Promise<IOrder> {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const orderUserId = (order.user as any)?._id ? (order.user as any)._id.toString() : order.user.toString();
    if (userRole !== 'admin' && orderUserId !== userId.toString()) {
      throw new ForbiddenException('You are not authorized to access this order');
    }

    if (order.paymentDetails.method !== 'cod') {
      throw new BadRequestException('This order is not configured for COD');
    }

    order.paymentDetails.status = 'pending';
    order.status = 'processing';
    await order.save();

    await this.deductInventory(order.items);

    if (order.coupon) {
      const coupon = await this.couponService.getCouponById(order.coupon.toString());
      if (coupon) {
        await this.couponService.incrementUsage(coupon.code);
      }
    }

    return order;
  }

  async getOrderById(id: string, userId: string, userRole: string): Promise<IOrder> {
    const order = await this.repository.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    if (userRole !== 'admin' && order.user.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to access this order');
    }

    return order;
  }

  async listUserOrders(userId: string, page: number, limit: number): Promise<any> {
    return await this.repository.list({ user: userId }, { page, limit, sort: { createdAt: -1 } });
  }

  async listAllOrders(page: number, limit: number, status?: string): Promise<any> {
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    return await this.repository.list(filter, { page, limit, sort: { createdAt: -1 } });
  }

  async updateOrderStatus(id: string, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled', paymentStatus?: 'pending' | 'paid' | 'failed'): Promise<IOrder> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    if (paymentStatus) {
      order.paymentDetails.status = paymentStatus;
    }
    await order.save();
    return order;
  }

  async getSalesStats(): Promise<any> {
    const stats = await this.repository.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    const statusBreakdown = await this.repository.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
    ]);

    const paymentBreakdown = await this.repository.aggregate([
      {
        $group: {
          _id: '$paymentDetails.method',
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
    ]);

    const result = stats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    return {
      totalRevenue: result.totalRevenue,
      totalOrders: result.totalOrders,
      avgOrderValue: Math.round(result.avgOrderValue * 100) / 100,
      statusBreakdown,
      paymentBreakdown,
    };
  }

  private async deductInventory(items: IOrderItem[]): Promise<void> {
    for (const item of items) {
      await Product.updateOne(
        { _id: item.product, 'variants.sku': item.variant.sku },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
    }
  }
}
