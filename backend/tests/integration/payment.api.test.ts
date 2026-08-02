import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '@/app';

describe('Payment API Integration Tests', () => {
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

  it('POST /api/public/payments/razorpay/create - should reject missing orderId', async () => {
    const res = await request(app)
      .post('/api/public/payments/razorpay/create')
      .send({});

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });
});
