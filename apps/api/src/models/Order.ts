import mongoose, { Schema, HydratedDocument } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId;
  quantity: number;
  price: number; // Price at time of order
  totalPrice: number; // price * quantity
}

export interface IPaymentDetails {
  paymentMethod: "phonepe" | "razorpay" | "payu" | "manual";
  phonepeOrderId?: string; // PhonePe's internal order ID
  phonepeTransactionId?: string; // PhonePe transaction ID
  merchantOrderId: string; // Our unique order ID for PhonePe
  amount: number; // Amount in paisa
  currency: string; // INR
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  failureReason?: string;
  gatewayResponse?: Record<string, unknown>; // Store raw gateway response
  paymentTimestamp?: Date;
  refundDetails?: {
    refundId: string;
    amount: number;
    reason: string;
    status: "pending" | "completed" | "failed";
    refundDate: Date;
  }[];
}

export interface IOrder {
  orderNumber: string; // Our internal order number
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  pricing: {
    subtotal: number;
    tax: number;
    discount: number;
    shippingCost: number;
    total: number; // Final amount in INR
  };
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled" | "refunded";
  paymentDetails: IPaymentDetails;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
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
  deliveryDetails?: {
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    trackingNumber?: string;
    trackingUrl?: string;
    courier?: string;
  };
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

const paymentDetailsSchema = new Schema<IPaymentDetails>({
  paymentMethod: {
    type: String,
    enum: ["phonepe", "razorpay", "payu", "manual"],
    required: true,
  },
  phonepeOrderId: {
    type: String,
  },
  phonepeTransactionId: {
    type: String,
  },
  merchantOrderId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount cannot be negative"],
  },
  currency: {
    type: String,
    default: "INR",
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "cancelled"],
    default: "pending",
  },
  failureReason: {
    type: String,
  },
  gatewayResponse: {
    type: Schema.Types.Mixed,
  },
  paymentTimestamp: {
    type: Date,
  },
  refundDetails: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
    },
    refundDate: Date,
  }],
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
    pricing: {
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
      discount: {
        type: Number,
        required: true,
        min: [0, "Discount cannot be negative"],
        default: 0,
      },
      shippingCost: {
        type: Number,
        required: true,
        min: [0, "Shipping cost cannot be negative"],
        default: 0,
      },
      total: {
        type: Number,
        required: true,
        min: [0, "Total cannot be negative"],
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "completed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentDetails: {
      type: paymentDetailsSchema,
      required: true,
    },
    customerDetails: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },
    shippingAddress: {
      type: addressSchema,
    },
    billingAddress: {
      type: addressSchema,
    },
    notes: {
      type: String,
      trim: true,
    },
    deliveryDetails: {
      estimatedDelivery: Date,
      actualDelivery: Date,
      trackingNumber: String,
      trackingUrl: String,
      courier: String,
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

// Indexes for performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "paymentDetails.status": 1 });
orderSchema.index({ "paymentDetails.merchantOrderId": 1 });
orderSchema.index({ "paymentDetails.phonepeOrderId": 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
