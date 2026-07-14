import { CouponRepository } from '../repositories/coupon.repository';
import { ICoupon } from '../models/coupon.model';
import { BadRequestException, NotFoundException } from '@/shared/exceptions';

export class CouponService {
  private repository = new CouponRepository();

  async createCoupon(data: Partial<ICoupon>): Promise<ICoupon> {
    const existing = await this.repository.findByCode(data.code || '');
    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }
    return await this.repository.create(data);
  }

  async getCouponById(id: string): Promise<ICoupon> {
    const coupon = await this.repository.findById(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async updateCoupon(id: string, data: Partial<ICoupon>): Promise<ICoupon> {
    const coupon = await this.repository.update(id, data);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async deleteCoupon(id: string): Promise<void> {
    const coupon = await this.repository.delete(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
  }

  async listCoupons(filter: any = {}, options: any = {}): Promise<any> {
    return await this.repository.list(filter, options);
  }

  async validateCoupon(code: string, orderAmount: number): Promise<{
    coupon: ICoupon;
    discountAmount: number;
  }> {
    const coupon = await this.repository.findByCode(code);
    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
      throw new BadRequestException('This coupon has expired or is not yet valid');
    }

    if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon usage limit has been reached');
    }

    if (orderAmount < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount of ₹${coupon.minOrderAmount} required to use this coupon`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount !== undefined && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    }

    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    return {
      coupon,
      discountAmount: Math.round(discountAmount),
    };
  }

  async incrementUsage(code: string): Promise<void> {
    const coupon = await this.repository.findByCode(code);
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }
  }
}
