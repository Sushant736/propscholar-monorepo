import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  otpCode?: string;
  otpExpires?: Date;
  refreshTokens: string[];
  cart: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
  generateOTP(): string;
}

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: "Variant",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
});

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    refreshTokens: [
      {
        type: String,
        select: false,
      },
    ],
    cart: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.otpCode;
        delete ret.otpExpires;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

userSchema.methods.generateOTP = function (): string {
  const otpLength = parseInt(process.env.OTP_LENGTH || "6");
  const otp = Math.floor(
    Math.pow(10, otpLength - 1) +
      Math.random() *
        (Math.pow(10, otpLength) - Math.pow(10, otpLength - 1) - 1)
  ).toString();

  this.otpCode = otp;
  this.otpExpires = new Date(
    Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES || "10") * 60 * 1000
  );

  return otp;
};

export const User = mongoose.model<IUserDocument>("User", userSchema);
