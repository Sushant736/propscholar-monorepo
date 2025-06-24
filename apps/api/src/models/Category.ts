import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryDocument extends Document {
  name: string;
  description?: string;
  image: string;
  isActive: boolean;
  products: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String,
      required: [true, "Category image is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
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
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

export const Category = mongoose.model<ICategoryDocument>(
  "Category",
  categorySchema
);
