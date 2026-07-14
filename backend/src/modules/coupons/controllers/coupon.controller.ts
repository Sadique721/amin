import { Request, Response, NextFunction } from 'express';
import { CouponService } from '../services/coupon.service';
import { ApiResponse } from '@/shared/api/ApiResponse';

export class CouponController {
  private service = new CouponService();

  createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupon = await this.service.createCoupon(req.body);
      res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully'));
    } catch (error) {
      next(error);
    }
  };

  getCouponById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupon = await this.service.getCouponById(req.params.id);
      res.status(200).json(new ApiResponse(200, coupon, 'Coupon retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupon = await this.service.updateCoupon(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, coupon, 'Coupon updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteCoupon(req.params.id);
      res.status(200).json(new ApiResponse(200, null, 'Coupon deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  listCoupons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const result = await this.service.listCoupons({}, { page, limit, sort: { createdAt: -1 } });
      res.status(200).json(new ApiResponse(200, result, 'Coupons list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  validateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, orderAmount } = req.body;
      const result = await this.service.validateCoupon(code, Number(orderAmount));
      res.status(200).json(new ApiResponse(200, result, 'Coupon code is valid'));
    } catch (error) {
      next(error);
    }
  };
}
