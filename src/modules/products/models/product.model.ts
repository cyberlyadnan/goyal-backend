import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export type ProductUnit =
  | 'pcs'
  | 'kg'
  | 'g'
  | 'ltr'
  | 'ml'
  | 'box'
  | 'pack'
  | 'case'
  | 'dozen';

export interface IProduct {
  productName: string;
  slug: string;
  brandId: Types.ObjectId;
  categoryId: Types.ObjectId;
  description?: string;
  sku: string;
  barcode?: string;
  weight?: number;
  unit: ProductUnit;
  mrp: number;
  sellingPrice: number;
  offerPrice?: number;
  gst: number;
  stock: number;
  minimumOrderQuantity: number;
  maximumOrderQuantity?: number;
  images: string[];
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
}

const PRODUCT_UNITS: ProductUnit[] = [
  'pcs',
  'kg',
  'g',
  'ltr',
  'ml',
  'box',
  'pack',
  'case',
  'dozen',
];

const productSchema = new Schema<IProductDocument>(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    description: { type: String, trim: true, maxlength: 5000 },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    weight: { type: Number, min: 0 },
    unit: {
      type: String,
      enum: PRODUCT_UNITS,
      default: 'pcs',
    },
    mrp: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, min: 0 },
    gst: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, default: 0, min: 0 },
    minimumOrderQuantity: { type: Number, default: 1, min: 1 },
    maximumOrderQuantity: { type: Number, min: 1 },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index({ brandId: 1, categoryId: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1, isAvailable: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1, isAvailable: 1 });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ productName: 'text', sku: 'text', barcode: 'text' });

export const Product: Model<IProductDocument> =
  mongoose.models.Product ??
  mongoose.model<IProductDocument>('Product', productSchema);

export default Product;
