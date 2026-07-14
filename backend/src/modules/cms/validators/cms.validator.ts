import { z } from 'zod';

export const createBannerSchema = z.object({
  body: z.object({
    title: z.string().trim().optional(),
    subtitle: z.string().trim().optional(),
    desktopImage: z.object({
      url: z.string().url('Desktop image URL must be a valid URL'),
      publicId: z.string().min(1, 'Desktop image public ID is required'),
    }),
    mobileImage: z.object({
      url: z.string().url('Mobile image URL must be a valid URL'),
      publicId: z.string().min(1, 'Mobile image public ID is required'),
    }).optional(),
    linkUrl: z.string().trim().optional(),
    order: z.number().default(0),
    isActive: z.boolean().default(true),
    type: z.enum(['hero', 'promotional', 'grid']).default('hero'),
  }),
});

export const updateBannerSchema = z.object({
  body: z.object({
    title: z.string().trim().optional(),
    subtitle: z.string().trim().optional(),
    desktopImage: z.object({
      url: z.string().url('Desktop image URL must be a valid URL'),
      publicId: z.string().min(1, 'Desktop image public ID is required'),
    }).optional(),
    mobileImage: z.object({
      url: z.string().url('Mobile image URL must be a valid URL'),
      publicId: z.string().min(1, 'Mobile image public ID is required'),
    }).optional(),
    linkUrl: z.string().trim().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
    type: z.enum(['hero', 'promotional', 'grid']).optional(),
  }),
});

export const createFaqSchema = z.object({
  body: z.object({
    question: z.string().trim().min(5, 'Question must be at least 5 characters'),
    answer: z.string().trim().min(5, 'Answer must be at least 5 characters'),
    order: z.number().default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updateFaqSchema = z.object({
  body: z.object({
    question: z.string().trim().min(5, 'Question must be at least 5 characters').optional(),
    answer: z.string().trim().min(5, 'Answer must be at least 5 characters').optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateBannerDTO = z.infer<typeof createBannerSchema>['body'];
export type UpdateBannerDTO = z.infer<typeof updateBannerSchema>['body'];
export type CreateFaqDTO = z.infer<typeof createFaqSchema>['body'];
export type UpdateFaqDTO = z.infer<typeof updateFaqSchema>['body'];
