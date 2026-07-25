import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { ApiResponse } from '@/shared/api/ApiResponse';
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';

export class OrderController {
  private service = new OrderService();

  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { items, shippingAddress, couponCode, paymentMethod } = req.body;
      const userId = (req as AuthenticatedRequest).user!.id;
      const order = await this.service.createOrder(userId, items, shippingAddress, couponCode, paymentMethod);
      res.status(201).json(new ApiResponse(201, order, 'Order created successfully'));
    } catch (error) {
      next(error);
    }
  };

  verifyRazorpayPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const userRole = authReq.user!.role;
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const order = await this.service.verifyRazorpayPayment(userId, userRole, razorpayOrderId, razorpayPaymentId, razorpaySignature);
      res.status(200).json(new ApiResponse(200, order, 'Razorpay payment verified successfully'));
    } catch (error) {
      next(error);
    }
  };

  verifyCodPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const userRole = authReq.user!.role;
      const { orderId } = req.body;
      const order = await this.service.verifyCodPayment(userId, userRole, orderId);
      res.status(200).json(new ApiResponse(200, order, 'COD order processed successfully'));
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const userRole = authReq.user!.role;
      const order = await this.service.getOrderById(req.params.id, userId, userRole);
      res.status(200).json(new ApiResponse(200, order, 'Order retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  listUserOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const result = await this.service.listUserOrders(userId, page, limit);
      res.status(200).json(new ApiResponse(200, result, 'User orders list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  listAllOrdersAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const status = req.query.status as string;
      const result = await this.service.listAllOrders(page, limit, status);
      res.status(200).json(new ApiResponse(200, result, 'Admin orders list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateOrderStatusAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, paymentStatus } = req.body;
      const order = await this.service.updateOrderStatus(req.params.id, status, paymentStatus);
      res.status(200).json(new ApiResponse(200, order, 'Order status updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getSalesStatsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getSalesStats();
      res.status(200).json(new ApiResponse(200, stats, 'Sales stats retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
