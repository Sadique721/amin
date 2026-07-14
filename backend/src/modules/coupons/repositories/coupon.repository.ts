import { Coupon, ICoupon } from '../models/coupon.model';

export class CouponRepository {
  async create(data: Partial<ICoupon>): Promise<ICoupon> {
    return await Coupon.create(data);
  }

  async findById(id: string): Promise<ICoupon | null> {
    return await Coupon.findById(id);
  }

  async findByCode(code: string): Promise<ICoupon | null> {
    return await Coupon.findOne({ code: code.toUpperCase() });
  }

  async update(id: string, data: Partial<ICoupon>): Promise<ICoupon | null> {
    return await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<ICoupon | null> {
    return await Coupon.findByIdAndDelete(id);
  }

  async list(filter: any = {}, options: any = {}): Promise<any> {
    return await Coupon.paginate(filter, options);
  }
}
