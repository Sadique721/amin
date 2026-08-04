import mongoose from 'mongoose';
import { Review, IReview } from '../models/review.model';

export class ReviewRepository {
  async create(data: Partial<IReview>): Promise<IReview> {
    return Review.create(data);
  }

  async findByProduct(
    productId: string,
    options: { page: number; limit: number }
  ): Promise<{ reviews: IReview[]; total: number; pages: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;

    const filter = { productId: new mongoose.Types.ObjectId(productId), isApproved: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Review.countDocuments(filter),
    ]);

    return {
      reviews,
      total,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<IReview | null> {
    return Review.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
    });
  }

  async findById(reviewId: string): Promise<IReview | null> {
    return Review.findById(reviewId);
  }

  async delete(reviewId: string, userId: string): Promise<IReview | null> {
    return Review.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(reviewId),
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  async calculateProductRating(productId: string): Promise<{ average: number; count: number }> {
    const result = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          isApproved: true,
        },
      },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return { average: 0, count: 0 };
    }

    return {
      average: Math.round(result[0].averageRating * 10) / 10,
      count: result[0].totalReviews,
    };
  }
}
