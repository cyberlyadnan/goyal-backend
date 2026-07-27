import { z } from 'zod';

const objectId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const addToCartSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(1).optional(),
});

export const updateCartSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(0),
});

export const removeCartItemParamsSchema = z.object({
  productId: objectId,
});

export const checkoutAddressSchema = z.object({
  line1: z.string().trim().min(3).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});

export const checkoutSchema = z.object({
  address: checkoutAddressSchema,
  notes: z.string().trim().max(1000).optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
