import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '@/app';
import { User } from '@/modules/users/models/user.model';

describe('Auth API Integration Tests', () => {
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
    await User.deleteMany({});
  });

  it('POST /api/public/auth/otp/send - should accept email and return OTP sent message', async () => {
    const res = await request(app)
      .post('/api/public/auth/otp/send')
      .send({ email: 'testuser@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/admin/dashboard/stats - should reject unauthenticated access with 401', async () => {
    const res = await request(app).get('/api/admin/dashboard/stats');
    expect(res.status).toBe(401);
  });
});
