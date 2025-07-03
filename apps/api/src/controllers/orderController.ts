import { Request, Response } from "express";
import { Order, IOrderDocument } from "../models/Order.js";
import { User } from "../models/User.js";
import { Variant } from "../models/Variant.js";
import { logger } from "../utils/logger.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { PhonePeService } from "../services/phonepeService.js";
import { FilterQuery } from "mongoose";

interface CreateOrderRequest {
  customerDetails?: {
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
  redirectUrl: string;
}

export class OrderController {
  /**
   * Generate a unique 8-digit order number
   */
  private static async generateOrderNumber(): Promise<string> {
    let orderNumber = '';
    let isUnique = false;
    
    // Generate a unique 8-digit order number
    while (!isUnique) {
      // Generate 8-digit number (10000000 to 99999999)
      const randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
      orderNumber = randomNumber.toString();
      
      // Check if this order number already exists
      const existingOrder = await Order.findOne({ orderNumber });
      if (!existingOrder) {
        isUnique = true;
      }
    }
    
    return orderNumber;
  }

  /**
   * Create a new order from user's cart
   */
  public static async createOrderFromCart(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id;
      console.log(userId)
      const { customerDetails, shippingAddress, billingAddress, notes, redirectUrl }: CreateOrderRequest = req.body;

      // Get user with cart
      const user = await User.findById(userId).populate([
        {
          path: "cart.product",
          select: "name images isActive",
        },
        {
          path: "cart.variant",
          select: "name comparePrice sku isActive stock",
        },
      ]);
      

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      if (!user.cart || user.cart.length === 0) {
        res.status(400).json({
          success: false,
          message: "Cart is empty",
        });
        return;
      }

      // Validate and calculate order totals
      let subtotal = 0;
      const orderItems = [];

      for (const cartItem of user.cart) {
        const product = cartItem.product as unknown as { _id: string; name: string; isActive: boolean };
        const variant = cartItem.variant as unknown as { _id: string; name: string; comparePrice: number; sku: string; isActive: boolean; stock: number };

        // Validate product and variant are active
        if (!product.isActive || !variant.isActive) {
          res.status(400).json({
            success: false,
            message: `Product ${product.name} is no longer available`,
          });
          return;
        }

        // Check stock availability
        if (variant.stock < cartItem.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name} - ${variant.name}. Available: ${variant.stock}`,
          });
          return;
        }

        const price = variant.comparePrice || 0;
        const totalPrice = price * cartItem.quantity;
        subtotal += totalPrice;

        orderItems.push({
          product: product._id,
          variant: variant._id,
          quantity: cartItem.quantity,
          price,
          totalPrice,
        });
      }

      // Calculate final pricing (you can add tax, shipping, discount logic here)
      const tax = 0; // Add tax calculation logic
      const shippingCost = 0; // Add shipping calculation logic
      const discount = 0; // Add discount logic
      const total = subtotal + tax + shippingCost - discount;

      // Use provided customer details or fallback to user details
      const finalCustomerDetails = customerDetails || {
        name: user.name,
        email: user.email,
        phone: user.phone,
      };

      // Generate merchant order ID
      const merchantOrderId = PhonePeService.generateMerchantOrderId();

      // Generate unique order number
      const orderNumber = await OrderController.generateOrderNumber();

      // Create order in our database first
      const order = new Order({
        orderNumber,
        user: userId,
        items: orderItems,
        pricing: {
          subtotal,
          tax,
          discount,
          shippingCost,
          total,
        },
        paymentDetails: {
          paymentMethod: "phonepe",
          merchantOrderId,
          amount: PhonePeService.convertToPaisa(total),
          currency: "INR",
          status: "pending",
        },
        customerDetails: finalCustomerDetails,
        shippingAddress,
        billingAddress,
        notes,
        status: "pending",
      });

      await order.save();

      // Create PhonePe payment order
      try {
        const phonepeService = PhonePeService.getInstance();
        const paymentOrder = await phonepeService.createOrder({
          amount: total,
          redirectUrl: `${redirectUrl}?orderId=${order._id}`,
          merchantOrderId,
        });

        // Update order with PhonePe details
        order.paymentDetails.phonepeOrderId = paymentOrder.orderId;
        await order.save();

        logger.info('Order created successfully', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          merchantOrderId,
          phonepeOrderId: paymentOrder.orderId,
          total,
        });

        res.status(201).json({
          success: true,
          message: "Order created successfully",
          data: {
            order: {
              _id: order._id,
              orderNumber: order.orderNumber,
              total: order.pricing.total,
              status: order.status,
              paymentStatus: order.paymentDetails.status,
            },
            payment: {
              redirectUrl: paymentOrder.redirectUrl,
              orderId: paymentOrder.orderId,
              merchantOrderId,
              expireAt: paymentOrder.expireAt,
            },
          },
        });
      } catch (paymentError) {
        // If payment order creation fails, mark our order as failed
        order.paymentDetails.status = "failed";
        order.paymentDetails.failureReason = "Payment gateway error";
        await order.save();

        logger.error('Payment order creation failed', {
          orderId: order._id,
          error: paymentError,
        });

        res.status(500).json({
          success: false,
          message: "Failed to create payment order",
          error: paymentError instanceof Error ? paymentError.message : 'Unknown error',
        });
      }
    } catch (error) {
      logger.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Handle PhonePe payment callback
   */
  public static async handlePaymentCallback(req: Request, res: Response): Promise<void> {
    try {
      const authorization = req.headers.authorization || '';
      const responseBody = JSON.stringify(req.body);

      logger.info('Received PhonePe callback', {
        authorization: authorization ? 'present' : 'missing',
        bodyKeys: Object.keys(req.body),
      });

      // Validate callback
      const phonepeService = PhonePeService.getInstance();
      const callbackData = phonepeService.validateCallback(authorization, responseBody);

      const { merchantOrderId, state, errorCode, detailedErrorCode } = callbackData.payload;

      // Find order by merchant order ID
      const order = await Order.findOne({
        'paymentDetails.merchantOrderId': merchantOrderId,
      });

      if (!order) {
        logger.error('Order not found for callback', { merchantOrderId });
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }

      // Update order based on payment status
      order.paymentDetails.status = this.mapPhonePeStateToStatus(state);
      order.paymentDetails.gatewayResponse = callbackData as unknown as Record<string, unknown>;
      order.paymentDetails.paymentTimestamp = new Date();

      if (state === 'COMPLETED') {
        order.status = 'confirmed';
        order.paymentDetails.phonepeTransactionId = callbackData.payload.transactionId;

        // Update stock quantities
        await this.updateStockAfterPayment(order);

        // Clear user's cart
        await User.findByIdAndUpdate(order.user, { cart: [] });

        logger.info('Payment completed successfully', {
          orderId: order._id,
          merchantOrderId,
          transactionId: callbackData.payload.transactionId,
        });
      } else if (state === 'FAILED') {
        order.status = 'cancelled';
        order.paymentDetails.failureReason = errorCode || detailedErrorCode || 'Payment failed';

        logger.warn('Payment failed', {
          orderId: order._id,
          merchantOrderId,
          errorCode,
          detailedErrorCode,
        });
      }

      await order.save();

      res.status(200).json({
        success: true,
        message: "Callback processed successfully",
      });
    } catch (error) {
      logger.error("Payment callback error:", error);
      res.status(500).json({
        success: false,
        message: "Callback processing failed",
      });
    }
  }

  /**
   * Check payment status and update order
   */
  public static async checkPaymentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?._id;

      const order = await Order.findOne({ _id: orderId, user: userId });

      if (!order) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }

      // Check status with PhonePe
      try {
        const phonepeService = PhonePeService.getInstance();
        const paymentStatus = await phonepeService.getOrderStatus(order.paymentDetails.merchantOrderId);

        // Update order status based on PhonePe response
        const newStatus = this.mapPhonePeStateToStatus(paymentStatus.state);
        
        if (order.paymentDetails.status !== newStatus) {
          order.paymentDetails.status = newStatus;
          
          if (paymentStatus.state === 'COMPLETED' && order.status === 'pending') {
            order.status = 'confirmed';
            await this.updateStockAfterPayment(order);
            await User.findByIdAndUpdate(order.user, { cart: [] });
          } else if (paymentStatus.state === 'FAILED' && order.status === 'pending') {
            order.status = 'cancelled';
          }
          
          await order.save();
        }

        res.status(200).json({
          success: true,
          data: {
            order: {
              _id: order._id,
              orderNumber: order.orderNumber,
              status: order.status,
              paymentStatus: order.paymentDetails.status,
              total: order.pricing.total,
            },
            paymentDetails: {
              state: paymentStatus.state,
              amount: PhonePeService.convertToINR(paymentStatus.amount),
              paymentDetails: paymentStatus.paymentDetails,
            },
          },
        });
      } catch (error) {
        logger.error('Failed to check payment status', {
          orderId,
          merchantOrderId: order.paymentDetails.merchantOrderId,
          error,
        });

        // Return current order status even if PhonePe check fails
        res.status(200).json({
          success: true,
          data: {
            order: {
              _id: order._id,
              orderNumber: order.orderNumber,
              status: order.status,
              paymentStatus: order.paymentDetails.status,
              total: order.pricing.total,
            },
            error: "Could not verify payment status with gateway",
          },
        });
      }
    } catch (error) {
      logger.error("Check payment status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all orders for a user
   */
  public static async getAllOrders(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id;
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const filter: FilterQuery<IOrderDocument> = { user: userId };

      if (status) filter.status = status;
      if (paymentStatus) filter["paymentDetails.status"] = paymentStatus;

      const sort = {} as Record<string, number>;
      sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

      const orders = await Order.find(filter)
        .populate("items.product", "name images")
        .populate("items.variant", "name sku")
        .skip(skip)
        .limit(Number(limit))
        .sort(sort as { [key: string]: 1 | -1 });

      const total = await Order.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      logger.error("Get all orders error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get order by ID
   */
  public static async getOrderById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      const order = await Order.findOne({ _id: id, user: userId })
        .populate("items.product", "name images description")
        .populate("items.variant", "name sku")
        .populate("user", "name email phone");

      if (!order) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          order,
        },
      });
    } catch (error) {
      logger.error("Get order by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Cancel an order (only if payment is pending)
   */
  public static async cancelOrder(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      const order = await Order.findOne({ _id: id, user: userId });

      if (!order) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }

      if (order.paymentDetails.status === "completed") {
        res.status(400).json({
          success: false,
          message: "Cannot cancel a paid order",
        });
        return;
      }

      if (order.status === "cancelled") {
        res.status(400).json({
          success: false,
          message: "Order is already cancelled",
        });
        return;
      }

      order.status = "cancelled";
      order.paymentDetails.status = "cancelled";
      await order.save();

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: { order },
      });
    } catch (error) {
      logger.error("Cancel order error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Helper methods

  private static mapPhonePeStateToStatus(state: string): "pending" | "processing" | "completed" | "failed" | "cancelled" {
    switch (state) {
      case 'PENDING':
        return 'pending';
      case 'PROCESSING':
        return 'processing';
      case 'COMPLETED':
        return 'completed';
      case 'FAILED':
        return 'failed';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  private static async updateStockAfterPayment(order: IOrderDocument): Promise<void> {
    try {
      for (const item of order.items) {
        await Variant.findByIdAndUpdate(
          item.variant,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      }
      logger.info('Stock updated after payment', { 
        orderId: order._id,
        itemCount: order.items.length 
      });
    } catch (error) {
      logger.error('Failed to update stock after payment', {
        orderId: order._id,
        error,
      });
      // Don't throw error as payment was successful
    }
  }

  // Method aliases for routes compatibility
  public static getAll = OrderController.getAllOrders;
  public static getById = OrderController.getOrderById;
  public static create = OrderController.createOrderFromCart;

  /**
   * Get order statistics (placeholder)
   */
  public static async getOrderStats(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id;

      const totalOrders = await Order.countDocuments({ user: userId });
      const completedOrders = await Order.countDocuments({ 
        user: userId, 
        status: 'completed' 
      });
      const pendingOrders = await Order.countDocuments({ 
        user: userId, 
        status: 'pending' 
      });

      res.status(200).json({
        success: true,
        data: {
          totalOrders,
          completedOrders,
          pendingOrders,
        },
      });
    } catch (error) {
      logger.error("Get order stats error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update order status (admin only - placeholder)
   */
  public static async updateStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!order) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Order status updated",
        data: { order },
      });
    } catch (error) {
      logger.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
