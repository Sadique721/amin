import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '@/app';
import { Coupon } from '@/modules/coupons/models/coupon.model';

describe('Coupon API Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({ binary: { checkMD5: false } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await Coupon.deleteMany({});
  });

  it('POST /api/public/coupons/validate - should validate coupon successfully', async () => {
    // Create a coupon directly in the test database
    await Coupon.create({
      code: 'PROMO15',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 100,
      startDate: new Date(Date.now() - 3600000),
      endDate: new Date(Date.now() + 3600000),
      isActive: true,
    });

    const res = await request(app)
      .post('/api/public/coupons/validate')
      .send({
        code: 'PROMO15',
        orderAmount: 200,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.discountAmount).toBe(30); // 15% of 200
  });

  it('POST /api/public/coupons/validate - should fail for non-existent coupon code', async () => {
    const res = await request(app)
      .post('/api/public/coupons/validate')
      .send({
        code: 'NOTFOUND',
        orderAmount: 200,
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/public/coupons/validate - should fail validation schema if code is missing', async () => {
    const res = await request(app)
      .post('/api/public/coupons/validate')
      .send({
        orderAmount: 200,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
