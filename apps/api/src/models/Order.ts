import mongoose, { Schema, HydratedDocument } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface IOrder {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  paymentTransactionId?: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  notes?: string;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IOrderDocument = HydratedDocument<IOrder>;

const orderItemSchema = new Schema<IOrderItem>({
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
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, "Total price cannot be negative"],
  },
});

const addressSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
  },
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    tax: {
      type: Number,
      required: true,
      min: [0, "Tax cannot be negative"],
      default: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: [0, "Shipping cost cannot be negative"],
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: [0, "Discount cannot be negative"],
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    paymentTransactionId: {
      type: String,
      trim: true,
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    billingAddress: {
      type: addressSchema,
    },
    notes: {
      type: String,
      trim: true,
    },
    estimatedDelivery: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    trackingUrl: {
      type: String,
      trim: true,
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
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Get count of orders for today
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const orderCount = await mongoose.model("Order").countDocuments({
      createdAt: { $gte: today },
    });

    const sequence = (orderCount + 1).toString().padStart(4, "0");
    this.orderNumber = `ORD${year}${month}${day}${sequence}`;
  }
  next();
});

export const Order = mongoose.model<IOrder>("Order", orderSchema);
