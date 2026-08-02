import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CouponService } from '@/modules/coupons/services/coupon.service';
import { Coupon } from '@/modules/coupons/models/coupon.model';

describe('CouponService Unit Tests', () => {
  let mongoServer: MongoMemoryServer;
  let service: CouponService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({ binary: { checkMD5: false } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    service = new CouponService();
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await Coupon.deleteMany({});
  });

  it('should successfully create a new coupon', async () => {
    const couponData = {
      code: 'TEST50',
      discountType: 'percentage' as const,
      discountValue: 50,
      minOrderAmount: 200,
      maxDiscountAmount: 100,
      startDate: new Date(Date.now() - 3600000), // 1 hour ago
      endDate: new Date(Date.now() + 3600000 * 24), // 24 hours later
      usageLimit: 10,
    };

    const coupon = await service.createCoupon(couponData);
    expect(coupon).toBeDefined();
    expect(coupon.code).toBe('TEST50');
    expect(coupon.discountValue).toBe(50);
  });

  it('should throw BadRequestException if coupon code already exists', async () => {
    const couponData = {
      code: 'DUPCODE',
      discountType: 'fixed' as const,
      discountValue: 100,
      startDate: new Date(Date.now() - 3600000),
      endDate: new Date(Date.now() + 3600000),
    };

    await service.createCoupon(couponData);
    await expect(service.createCoupon(couponData)).rejects.toThrow('Coupon code already exists');
  });

  it('should successfully validate a percentage coupon', async () => {
    await service.createCoupon({
      code: 'SAVE20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 500,
      maxDiscountAmount: 200,
      startDate: new Date(Date.now() - 3600000),
      endDate: new Date(Date.now() + 3600000),
      usageLimit: 5,
      usedCount: 0,
      isActive: true,
    });

    const result = await service.validateCoupon('SAVE20', 1000);
    expect(result.discountAmount).toBe(200); // 20% of 1000 is 200
  });

  it('should cap percentage coupon discount at maxDiscountAmount', async () => {
    await service.createCoupon({
      code: 'SAVE20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 500,
      maxDiscountAmount: 150,
      startDate: new Date(Date.now() - 3600000),
      endDate: new Date(Date.now() + 3600000),
      usageLimit: 5,
      usedCount: 0,
      isActive: true,
    });

    const result = await service.validateCoupon('SAVE20', 1000);
    expect(result.discountAmount).toBe(150); // 20% of 1000 is 200, but capped at 150
  });

  it('should throw BadRequestException if order amount is less than minOrderAmount', async () => {
    await service.createCoupon({
      code: 'MIN500',
      discountType: 'fixed',
      discountValue: 100,
      minOrderAmount: 500,
      startDate: new Date(Date.now() - 3600000),
      endDate: new Date(Date.now() + 3600000),
    });

    await expect(service.validateCoupon('MIN500', 400)).rejects.toThrow('Minimum order amount of ₹500 required');
  });

  it('should throw BadRequestException if coupon is expired', async () => {
    await service.createCoupon({
      code: 'EXPIRED',
      discountType: 'fixed',
      discountValue: 100,
      startDate: new Date(Date.now() - 7200000),
      endDate: new Date(Date.now() - 3600000),
    });

    await expect(service.validateCoupon('EXPIRED', 1000)).rejects.toThrow('This coupon has expired or is not yet valid');
  });
});
