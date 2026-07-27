import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  offerPrice?: number;
  total: number;
}

export interface ICart {
  retailerId: Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  discount: number;
  gst: number;
  deliveryCharges: number;
  grandTotal: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartDocument extends ICart, Document {
  _id: Types.ObjectId;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const cartSchema = new Schema<ICartDocument>(
  {
    retailerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    gst: { type: Number, default: 0, min: 0 },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, default: 0, min: 0 },
    totalItems: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Cart: Model<ICartDocument> =
  mongoose.models.Cart ?? mongoose.model<ICartDocument>('Cart', cartSchema);

export default Cart;
