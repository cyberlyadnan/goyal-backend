import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IBrand {
  name: string;
  slug: string;
  logo?: string;
  bannerImage?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrandDocument extends IBrand, Document {
  _id: Types.ObjectId;
}

const brandSchema = new Schema<IBrandDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: { type: String, trim: true },
    bannerImage: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 2000 },
    displayOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

brandSchema.index({ name: 1 });
brandSchema.index({ isActive: 1, displayOrder: 1 });

export const Brand: Model<IBrandDocument> =
  mongoose.models.Brand ??
  mongoose.model<IBrandDocument>('Brand', brandSchema);

export default Brand;
