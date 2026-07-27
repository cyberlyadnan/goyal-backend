import { z } from 'zod';

const objectId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid id');

const productUnit = z.enum([
  'pcs',
  'kg',
  'g',
  'ltr',
  'ml',
  'box',
  'pack',
  'case',
  'dozen',
]);

const booleanQuery = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === 'true'));

export const createProductSchema = z
  .object({
    productName: z.string().trim().min(2).max(200),
    slug: z.string().trim().min(2).max(220).optional(),
    brandId: objectId,
    categoryId: objectId,
    description: z.string().trim().max(5000).optional(),
    sku: z.string().trim().min(2).max(64),
    barcode: z.string().trim().max(64).optional(),
    weight: z.coerce.number().min(0).optional(),
    unit: productUnit.optional(),
    mrp: z.coerce.number().min(0),
    sellingPrice: z.coerce.number().min(0),
    offerPrice: z.coerce.number().min(0).optional(),
    gst: z.coerce.number().min(0).max(100).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    minimumOrderQuantity: z.coerce.number().int().min(1).optional(),
    maximumOrderQuantity: z.coerce.number().int().min(1).optional(),
    images: z.array(z.string().url()).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    isFeatured: z.coerce.boolean().optional(),
    isBestSeller: z.coerce.boolean().optional(),
    isAvailable: z.coerce.boolean().optional(),
    isActive: z.coerce.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.offerPrice !== undefined && data.offerPrice > data.sellingPrice) {
      ctx.addIssue({
        code: 'custom',
        path: ['offerPrice'],
        message: 'Offer price cannot exceed selling price',
      });
    }
    if (data.sellingPrice > data.mrp) {
      ctx.addIssue({
        code: 'custom',
        path: ['sellingPrice'],
        message: 'Selling price cannot exceed MRP',
      });
    }
  });

export const updateProductSchema = createProductSchema.partial();

export const productIdParamsSchema = z.object({
  id: objectId,
});

export const updateStockSchema = z.object({
  stock: z.coerce.number().int().min(0),
});

export const toggleFlagSchema = z.object({
  value: z.coerce.boolean().optional(),
});

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  brandId: objectId.optional(),
  categoryId: objectId.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isFeatured: booleanQuery,
  isBestSeller: booleanQuery,
  isAvailable: booleanQuery,
  isActive: booleanQuery,
  sort: z
    .enum(['newest', 'price_low', 'price_high', 'alphabetical'])
    .optional(),
  sortBy: z
    .enum(['productName', 'sellingPrice', 'createdAt', 'stock'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
