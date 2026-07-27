import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import { ROLES, type Role } from '../../../constants/roles.constant.js';

export const AUTH_ROLES = [ROLES.ADMIN, ROLES.RETAILER] as const;
export type AuthRole = (typeof AUTH_ROLES)[number];

export interface IUserAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface IUser {
  fullName: string;
  mobile: string;
  email?: string;
  password?: string;
  role: AuthRole | Role;
  shopName?: string;
  gstNumber?: string;
  address?: IUserAddress;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

const addressSchema = new Schema<IUserAddress>(
  {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
  },
  { _id: false },
);

const userSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      index: true,
    },
    shopName: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    address: {
      type: addressSchema,
      default: undefined,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        const user = ret as Record<string, unknown>;
        delete user.password;
        delete user.refreshToken;
        return user;
      },
    },
  },
);

userSchema.index({ role: 1, isActive: 1 });

export const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>('User', userSchema);

export default User;
