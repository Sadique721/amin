import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    orderId: z.string().optional(),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
    comment: z.string().min(3, 'Comment must be at least 3 characters').max(1000, 'Comment cannot exceed 1000 characters'),
    images: z.array(z.string().url('Invalid image URL')).optional(),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
