import { ReviewRepository } from '../repositories/review.repository';
import { Product } from '@/modules/products/models/product.model';
import { Order } from '@/modules/orders/models/order.model';
import { BadRequestException, NotFoundException, ForbiddenException } from '@/shared/exceptions';

export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async createReview(userId: string, data: {
    productId: string;
    orderId?: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }) {
    // 1. Verify product exists
    const product = await Product.findById(data.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2. Check for duplicate review
    const existing = await this.reviewRepository.findByUserAndProduct(userId, data.productId);
    if (existing) {
      throw new BadRequestException('You have already submitted a review for this product');
    }

    // 3. Verify purchase history
    const order = await Order.findOne({
      userId,
      'items.productId': data.productId,
      status: { $in: ['processing', 'shipped', 'delivered', 'completed'] },
    });

    const isVerifiedPurchase = !!order;

    // 4. Create review
    const review = await this.reviewRepository.create({
      productId: product._id,
      userId: userId as any,
      orderId: order ? order._id : undefined,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images || [],
      isVerifiedPurchase,
      isApproved: true,
    });

    // 5. Update Product ratings summary
    await this.updateProductRatings(data.productId);

    return review;
  }

  async getProductReviews(productId: string, options: { page: number; limit: number }) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.reviewRepository.findByProduct(productId, options);
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized to delete this review');
    }

    await this.reviewRepository.delete(reviewId, userId);
    await this.updateProductRatings(review.productId.toString());

    return { message: 'Review deleted successfully' };
  }

  private async updateProductRatings(productId: string) {
    const { average, count } = await this.reviewRepository.calculateProductRating(productId);
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: average,
      ratingsQuantity: count,
    });
  }
}
