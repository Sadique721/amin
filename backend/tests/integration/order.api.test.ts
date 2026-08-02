import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '@/app';
import { Order } from '@/modules/orders/models/order.model';
import { Product } from '@/modules/products/models/product.model';
import { Category } from '@/modules/categories/models/category.model';

describe('Order API Integration Tests', () => {
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
    await Order.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
  });

  it('POST /api/public/orders - should reject order creation with empty items', async () => {
    const res = await request(app)
      .post('/api/public/orders')
      .send({
        items: [],
        shippingAddress: {
          fullName: 'John Doe',
          addressLine1: '123 Main St',
          city: 'Metropolis',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          phone: '1234567890',
        },
        paymentMethod: 'cod',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });
});
