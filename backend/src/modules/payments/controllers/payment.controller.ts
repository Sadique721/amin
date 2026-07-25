import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '@/config/env';
import { ApiResponse } from '@/shared/api/ApiResponse';
import { ApiError } from '@/shared/api/ApiError';
import { Order } from '@/modules/orders/models/order.model';
import { logger } from '@/shared/logger';

let razorpayInstance: Razorpay | null = null;
if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

export class PaymentController {
  /**
   * Create Razorpay Order
   */
  static async createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!razorpayInstance) {
        throw new ApiError(500, 'Razorpay integration is not configured with valid API keys');
      }

      const { orderId } = req.body;
      if (!orderId) {
        throw new ApiError(400, 'Order ID is required');
      }

      const order = await Order.findById(orderId);
      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      // Razorpay expects amount in paise (INR * 100)
      const options = {
        amount: Math.round(order.total * 100),
        currency: 'INR',
        receipt: `receipt_${order._id}`,
        notes: {
          orderId: order._id.toString(),
          userId: order.user.toString(),
        },
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      // Save Razorpay Order ID to Order entity
      order.paymentDetails.razorpayOrderId = razorpayOrder.id;
      await order.save();

      res.status(200).json(
        new ApiResponse(
          200,
          {
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: env.RAZORPAY_KEY_ID,
          },
          'Razorpay order created successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Razorpay Payment Signature
   */
  static async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new ApiError(400, 'Missing required payment verification parameters');
      }

      const keySecret = env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        throw new ApiError(500, 'Razorpay secret key is not configured');
      }

      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        throw new ApiError(400, 'Invalid payment signature verification failed');
      }

      const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpayOrderId });
      if (!order) {
        throw new ApiError(404, 'Associated order not found');
      }

      order.paymentDetails.status = 'paid';
      order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
      order.paymentDetails.razorpaySignature = razorpaySignature;
      order.status = 'processing';
      await order.save();

      res.status(200).json(
        new ApiResponse(
          200,
          { orderId: order._id, status: order.status },
          'Payment verified successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Razorpay Webhook Events
   */
  static async handleRazorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
      if (webhookSecret) {
        const signature = req.headers['x-razorpay-signature'] as string;
        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
          logger.warn('⚠️ Razorpay webhook signature verification failed');
          res.status(400).json({ status: 'invalid signature' });
          return;
        }
      }

      const event = req.body.event;
      logger.info(`📡 Received Razorpay Webhook Event: ${event}`);

      if (event === 'payment.captured') {
        const paymentEntity = req.body.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;

        const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpayOrderId });
        if (order && order.paymentDetails.status !== 'paid') {
          order.paymentDetails.status = 'paid';
          order.paymentDetails.razorpayPaymentId = paymentEntity.id;
          order.status = 'processing';
          await order.save();
          logger.info(`✅ Order ${order._id} marked as PAID via webhook`);
        }
      }

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      next(error);
    }
  }
}
