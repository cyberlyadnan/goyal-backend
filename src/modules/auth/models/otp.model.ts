import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IOtp {
  mobile: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOtpDocument extends IOtp, Document {
  _id: Types.ObjectId;
}

const otpSchema = new Schema<IOtpDocument>(
  {
    mobile: {
      type: String,
      required: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Auto-purge expired OTP documents (TTL).
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp: Model<IOtpDocument> =
  mongoose.models.Otp ?? mongoose.model<IOtpDocument>('Otp', otpSchema);

export default Otp;
