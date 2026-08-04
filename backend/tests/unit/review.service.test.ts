import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ReviewRepository } from '@/modules/reviews/repositories/review.repository';
import { Review } from '@/modules/reviews/models/review.model';

describe('ReviewRepository Unit Tests', () => {
  let mongoServer: MongoMemoryServer;
  let repository: ReviewRepository;
  const sampleProductId = new mongoose.Types.ObjectId().toString();
  const sampleUserId1 = new mongoose.Types.ObjectId();
  const sampleUserId2 = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({ binary: { checkMD5: false } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    repository = new ReviewRepository();
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await Review.deleteMany({});
  });

  it('should create a review successfully', async () => {
    const review = await repository.create({
      productId: sampleProductId as any,
      userId: sampleUserId1,
      rating: 5,
      title: 'Exquisite piece!',
      comment: 'Very high quality product.',
      isVerifiedPurchase: true,
      isApproved: true,
    });

    expect(review).toBeDefined();
    expect(review.rating).toBe(5);
    expect(review.isVerifiedPurchase).toBe(true);
  });

  it('should calculate product ratings average and count correctly', async () => {
    await repository.create({
      productId: sampleProductId as any,
      userId: sampleUserId1,
      rating: 5,
      comment: 'Superb quality',
      isApproved: true,
    });

    await repository.create({
      productId: sampleProductId as any,
      userId: sampleUserId2,
      rating: 3,
      comment: 'Average product',
      isApproved: true,
    });

    const ratingSummary = await repository.calculateProductRating(sampleProductId);
    expect(ratingSummary.count).toBe(2);
    expect(ratingSummary.average).toBe(4); // (5 + 3) / 2 = 4.0
  });

  it('should return average 0 when product has no approved reviews', async () => {
    const ratingSummary = await repository.calculateProductRating(sampleProductId);
    expect(ratingSummary.count).toBe(0);
    expect(ratingSummary.average).toBe(0);
  });
});
