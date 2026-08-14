import { z } from 'zod';

export const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
});
