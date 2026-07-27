import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document {
  _id: Types.ObjectId;
}

const categorySchema = new Schema<ICategoryDocument>(
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
    image: { type: String, trim: true },
    displayOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

export const Category: Model<ICategoryDocument> =
  mongoose.models.Category ??
  mongoose.model<ICategoryDocument>('Category', categorySchema);

export default Category;
