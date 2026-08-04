import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '@/config/env';
import { ApiResponse } from '@/shared/api/ApiResponse';
import { ApiError } from '@/shared/api/ApiError';
import { Order } from '@/modules/orders/models/order.model';
import { logger } from '@/shared/logger';
import { AuthorizeNetService } from '../services/authorizenet.service';

import { WebhookLog } from '../models/webhook-log.model';

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
          userId: order.user ? order.user.toString() : 'guest',
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
      const eventId = (req.headers['x-razorpay-event-id'] as string) ||
        (req.body.payload?.payment?.entity?.id ? `${event}_${req.body.payload.payment.entity.id}` : `evt_${Date.now()}`);

      // Idempotency check via WebhookLog
      const existingLog = await WebhookLog.findOne({ eventId });
      if (existingLog) {
        logger.info(`ℹ️ Webhook event ${eventId} already processed (idempotent skip)`);
        res.status(200).json({ status: 'ignored duplicate' });
        return;
      }

      logger.info(`📡 Received Razorpay Webhook Event: ${event} [${eventId}]`);

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

      // Record successful webhook execution
      await WebhookLog.create({
        provider: 'razorpay',
        eventId,
        payload: req.body,
        processedStatus: 'success',
      });

      res.status(200).json({ status: 'ok' });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Charge Card via Authorize.Net
   * POST /api/payments/authorizenet/charge
   */
  static async chargeAuthorizeNet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, cardNumber, expirationDate, cardCode } = req.body;

      if (!orderId || !cardNumber || !expirationDate) {
        throw new ApiError(400, 'orderId, cardNumber, and expirationDate are required');
      }

      const order = await Order.findById(orderId);
      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      const result = await AuthorizeNetService.chargeCard({
        amount: order.total,
        card: { cardNumber, expirationDate, cardCode },
        description: `SANAB Order #${order._id}`,
        orderId: order._id.toString(),
      });

      if (!result.success) {
        throw new ApiError(402, result.message || 'Payment declined');
      }

      // Update order payment status
      order.paymentDetails = {
        ...order.paymentDetails,
        status: 'paid',
        transactionId: result.transactionId,
        authCode: result.authCode,
      } as any;
      order.status = 'processing';
      await order.save();

      res.status(200).json(
        new ApiResponse(
          200,
          {
            orderId: order._id,
            transactionId: result.transactionId,
            authCode: result.authCode,
            status: order.status,
          },
          'Payment processed successfully via Authorize.Net'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authorize.Net Silent Post Webhook
   * POST /api/payments/authorizenet/webhook
   */
  static async handleAuthorizeNetWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { x_response_code, x_trans_id, x_auth_code, x_invoice_num } = req.body;

      logger.info(`[AUTHORIZE.NET WEBHOOK] Response Code: ${x_response_code}, Transaction: ${x_trans_id}`);

      if (x_response_code === '1' && x_invoice_num) {
        const order = await Order.findById(x_invoice_num);
        if (order && order.paymentDetails.status !== 'paid') {
          order.paymentDetails = {
            ...order.paymentDetails,
            status: 'paid',
            transactionId: x_trans_id,
            authCode: x_auth_code,
          } as any;
          order.status = 'processing';
          await order.save();
          logger.info(`✅ Order ${order._id} marked as PAID via Authorize.Net webhook`);
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      next(error);
    }
  }
}
