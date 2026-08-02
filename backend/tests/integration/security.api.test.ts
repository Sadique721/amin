import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '@/app';
import { Category } from '@/modules/categories/models/category.model';
import { Product } from '@/modules/products/models/product.model';

describe('Security and Input Validation Tests', () => {
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
    await Category.deleteMany({});
    await Product.deleteMany({});
  });

  it('GET /api/public/products - should handle special regex characters in category search without crashing', async () => {
    // Create a dummy category
    await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      isActive: true,
    });

    // Special regex characters that might crash a naïve RegExp constructor
    const dangerousCategoryParam = '.*+?^${}()|[\\]\\\\';

    const res = await request(app)
      .get('/api/public/products')
      .query({ category: dangerousCategoryParam });

    // The endpoint should respond successfully (even with 0 results) rather than crashing the server or throwing a 500 error
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results).toBeInstanceOf(Array);
  });
});
