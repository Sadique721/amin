import { z } from 'zod';

export const addressValidationSchema = z.object({
  street: z.string({ required_error: 'Street is required' }).trim().min(1, 'Street cannot be empty'),
  city: z.string({ required_error: 'City is required' }).trim().min(1, 'City cannot be empty'),
  state: z.string({ required_error: 'State is required' }).trim().min(1, 'State cannot be empty'),
  postalCode: z.string({ required_error: 'Postal code is required' }).trim().min(5, 'Postal code must be at least 5 digits'),
  country: z.string().trim().default('India'),
  isDefault: z.boolean().default(false),
});

export const createUserValidationSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
  email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address'),
  phone: z.string().trim().optional(),
  role: z.enum(['customer', 'admin', 'staff']).default('customer'),
  addresses: z.array(addressValidationSchema).optional(),
});

export const updateUserValidationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().trim().optional(),
  password: z.string().trim().min(6, 'Password must be at least 6 characters').optional(),
});

export type CreateUserDTO = z.infer<typeof createUserValidationSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserValidationSchema>;
export type AddressDTO = z.infer<typeof addressValidationSchema>;
