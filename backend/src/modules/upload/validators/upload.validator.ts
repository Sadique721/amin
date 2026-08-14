import { z } from 'zod';

export const deleteAssetSchema = z.object({
  publicId: z.string().min(1, 'publicId is required'),
});
