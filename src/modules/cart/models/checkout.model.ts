import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

/** Snapshot of a cart line at checkout time (payment comes later). */
export interface ICheckoutItem {
  productId: Types.ObjectId;
  productName: string;
  sku: string;
  brandName?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  offerPrice?: number;
  gstRate: number;
  total: number;
}

export interface ICheckoutAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type CheckoutStatus = 'awaiting_payment' | 'cancelled';

/**
 * Confirmed checkout intent — not an Order.
 * Payment / Orders modules will consume this in a later phase.
 */
export interface ICheckout {
  retailerId: Types.ObjectId;
  items: ICheckoutItem[];
  address: ICheckoutAddress;
  notes?: string;
  subtotal: number;
  discount: number;
  gst: number;
  deliveryCharges: number;
  grandTotal: number;
  totalItems: number;
  status: CheckoutStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICheckoutDocument extends ICheckout, Document {
  _id: Types.ObjectId;
}

const checkoutItemSchema = new Schema<ICheckoutItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    brandName: { type: String },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, min: 0 },
    gstRate: { type: Number, required: true, min: 0, max: 100 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const checkoutAddressSchema = new Schema<ICheckoutAddress>(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const checkoutSchema = new Schema<ICheckoutDocument>(
  {
    retailerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: { type: [checkoutItemSchema], required: true },
    address: { type: checkoutAddressSchema, required: true },
    notes: { type: String, trim: true, maxlength: 1000 },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0 },
    gst: { type: Number, required: true, min: 0 },
    deliveryCharges: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    totalItems: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['awaiting_payment', 'cancelled'],
      default: 'awaiting_payment',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Checkout: Model<ICheckoutDocument> =
  mongoose.models.Checkout ??
  mongoose.model<ICheckoutDocument>('Checkout', checkoutSchema);

export default Checkout;
