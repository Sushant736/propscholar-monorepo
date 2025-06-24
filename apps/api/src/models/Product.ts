import mongoose, { Schema, HydratedDocument } from "mongoose";

export interface IProduct {
  name: string;
  description: string;
  images: string[];
  category: mongoose.Types.ObjectId;
  variants: mongoose.Types.ObjectId[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type IProductDocument = HydratedDocument<IProduct>;

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    variants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Variant",
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO description cannot exceed 160 characters"],
    },
    seoKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
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
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ tags: 1 });

// Text index for search functionality
productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

export const Product = mongoose.model<IProduct>("Product", productSchema);
