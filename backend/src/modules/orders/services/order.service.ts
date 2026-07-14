import { OrderRepository } from '../repositories/order.repository';
import { IOrder, IOrderItem } from '../models/order.model';
import { Product } from '@/modules/products/models/product.model';
import { CouponService } from '@/modules/coupons/services/coupon.service';
import { BadRequestException, NotFoundException } from '@/shared/exceptions';
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
    paymentMethod: 'razorpay' | 'cod' = 'razorpay'
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
    
    const paymentDetails: any = {
      method: paymentMethod,
      status: 'pending',
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
      status: 'pending',
    });

    return order;
  }

  async verifyRazorpayPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<IOrder> {
    const order = await this.repository.findByRazorpayOrderId(razorpayOrderId);
    if (!order) {
      throw new NotFoundException('Order not found with this Razorpay order ID');
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

  async verifyCodPayment(orderId: string): Promise<IOrder> {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
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

  async getOrderById(id: string): Promise<IOrder> {
    const order = await this.repository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async listUserOrders(userId: string, page: number, limit: number): Promise<any> {
    return await this.repository.list({ user: userId }, { page, limit, sort: { createdAt: -1 } });
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
