import mongoose, { Schema, Document } from "mongoose";

export interface IVariantDocument extends Document {
  name: string;
  comparePrice?: number;
  costPrice?: number;
  isActive: boolean;
  product: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const variantSchema = new Schema<IVariantDocument>(
  {
    name: {
      type: String,
      required: [true, "Variant name is required"],
      trim: true,
      maxlength: [100, "Variant name cannot exceed 100 characters"],
    },
    comparePrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
    },
    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for performance
variantSchema.index({ product: 1 });
variantSchema.index({ isActive: 1 });

export const Variant = mongoose.model<IVariantDocument>(
  "Variant",
  variantSchema
);
