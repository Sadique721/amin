import { z } from 'zod';

const variantSchema = z.object({
  sku: z.string({ required_error: 'SKU is required' }).trim(),
  price: z.number({ required_error: 'Price is required' }).min(0),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number({ required_error: 'Stock is required' }).min(0),
  attributes: z.record(z.any()).default({}),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    description: z.string({ required_error: 'Description is required' }).trim(),
    category: z.string({ required_error: 'Category ID is required' }).trim(),
    brand: z.string({ required_error: 'Brand is required' }).trim(),
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    type: z.enum(['jewellery', 'cosmetics'], { required_error: 'Type must be jewellery or cosmetics' }),
    specifications: z.record(z.any()).optional(),
    variants: z.array(variantSchema).min(1, 'At least one product variant is required'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    description: z.string().trim().optional(),
    category: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    type: z.enum(['jewellery', 'cosmetics']).optional(),
    specifications: z.record(z.any()).optional(),
    variants: z.array(variantSchema).optional(),
  }),
});
