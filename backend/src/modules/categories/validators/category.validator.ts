import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    description: z.string().trim().optional(),
    parent: z.string().trim().optional().nullable(),
    image: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    description: z.string().trim().optional(),
    parent: z.string().trim().optional().nullable(),
    image: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  }),
});
