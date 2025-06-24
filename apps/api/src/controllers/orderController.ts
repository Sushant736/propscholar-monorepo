import { Request, Response } from "express";
import { Order, IOrderDocument } from "../models/Order.js";
import { User } from "../models/User.js";
import { Variant } from "../models/Variant.js";
import { logger } from "../utils/logger.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export class OrderController {
  public static async create(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { items, shippingAddress, billingAddress, paymentMethod, notes } =
        req.body;

      // Validate user
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Validate items and calculate totals
      let subtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const variant = await Variant.findById(item.variant).populate(
          "product"
        );
        if (!variant) {
          res.status(400).json({
            success: false,
            message: `Variant ${item.variant} not found`,
          });
          return;
        }

        if (variant.stock < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for variant ${variant.name}`,
          });
          return;
        }

        const totalPrice = variant.price * item.quantity;
        subtotal += totalPrice;

        validatedItems.push({
          product: variant.product._id,
          variant: variant._id,
          quantity: item.quantity,
          price: variant.price,
          totalPrice,
        });
      }

      // Calculate totals (you can add tax and shipping logic here)
      const tax = 0; // Add tax calculation logic
      const shippingCost = 0; // Add shipping calculation logic
      const discount = 0; // Add discount logic
      const total = subtotal + tax + shippingCost - discount;

      const order = new Order({
        user: userId,
        items: validatedItems,
        subtotal,
        tax,
        shippingCost,
        discount,
        total,
        paymentMethod,
        shippingAddress,
        billingAddress,
        notes,
      });

      await order.save();

      // Update stock
      for (const item of items) {
        const variant = await Variant.findById(item.variant);
        if (variant) {
          variant.stock -= item.quantity;
          await variant.save();
        }
      }

      // Clear user's cart
      user.cart = [];
      await user.save();

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          order,
        },
      });
    } catch (error) {
      logger.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async getAll(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = { user: userId };

      if (status) filter.status = status;
      if (paymentStatus) filter.paymentStatus = paymentStatus;

      const sort: any = {};
      sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

      const orders = await Order.find(filter)
        .populate("items.product", "name images")
        .populate("items.variant", "name sku")
        .skip(skip)
        .limit(Number(limit))
        .sort(sort);

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

  public static async getById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const order = await Order.findOne({ _id: id, user: userId })
        .populate("items.product", "name images description")
        .populate("items.variant", "name sku price")
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

  public static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        status,
        paymentStatus,
        trackingNumber,
        trackingUrl,
        estimatedDelivery,
      } = req.body;

      const order = await Order.findById(id);

      if (!order) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }

      // Update fields
      if (status) order.status = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (trackingUrl) order.trackingUrl = trackingUrl;
      if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order updated successfully",
        data: {
          order,
        },
      });
    } catch (error) {
      logger.error("Update order error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async cancelOrder(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const order = await Order.findOne({ _id: id, user: userId });

      if (!order) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }

      // Check if order can be cancelled
      if (order.status !== "pending" && order.status !== "confirmed") {
        res.status(400).json({
          success: false,
          message: "Order cannot be cancelled at this stage",
        });
        return;
      }

      order.status = "cancelled";
      await order.save();

      // Restore stock
      for (const item of order.items) {
        const variant = await Variant.findById(item.variant);
        if (variant) {
          variant.stock += item.quantity;
          await variant.save();
        }
      }

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: {
          order,
        },
      });
    } catch (error) {
      logger.error("Cancel order error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async getOrderStats(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      const stats = await Order.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$total" },
            averageOrderValue: { $avg: "$total" },
          },
        },
      ]);

      const statusStats = await Order.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: {
          stats: stats[0] || {
            totalOrders: 0,
            totalSpent: 0,
            averageOrderValue: 0,
          },
          statusStats,
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
}
