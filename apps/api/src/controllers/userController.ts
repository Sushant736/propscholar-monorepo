import { Request, Response } from "express";
import { User, IUserDocument, ICartItem } from "../models/User.js";
import { JWTService } from "../utils/jwt.js";
import { EmailService } from "../services/emailService.js";
import { logger } from "../utils/logger.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export class UserController {
  public static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message:
            existingUser.email === email
              ? "Email already registered"
              : "Phone number already registered",
        });
        return;
      }

      // Create new user
      const user = new User({
        name,
        email,
        phone,
      });

      // Generate OTP for verification
      const otpCode = user.generateOTP();
      await user.save();

      // Send OTP email
      try {
        const html = EmailService.getOTPTemplate(name, otpCode);
        await EmailService.sendEmail(email, "Your Verification Code", html);
      } catch (emailError) {
        logger.error("Failed to send OTP email:", emailError);
      }

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please verify your email with OTP.",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
          },
        },
      });
    } catch (error) {
      logger.error("Signup error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async signin(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      // Find user
      const user = await User.findOne({ email }).select("+otpCode +otpExpires");

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid email",
        });
        return;
      }

      // Check if OTP is provided
      if (otp) {
        // Verify OTP
        if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
          res.status(400).json({
            success: false,
            message: "OTP has expired. Please request a new one.",
          });
          return;
        }

        if (user.otpCode !== otp) {
          res.status(400).json({
            success: false,
            message: "Invalid OTP",
          });
          return;
        }

        // Clear OTP after successful verification
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();
      } else {
        // Generate and send OTP
        const otpCode = user.generateOTP();
        await user.save();

        try {
          const html = EmailService.getOTPTemplate(user.name, otpCode);
          await EmailService.sendEmail(
            email,
            "Your Login Verification Code",
            html
          );

          res.status(200).json({
            success: true,
            message: "OTP sent to your email. Please verify to complete login.",
            requiresOTP: true,
          });
          return;
        } catch (emailError) {
          logger.error("Failed to send OTP email:", emailError);
          res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again.",
          });
          return;
        }
      }

      // Generate tokens after successful OTP verification
      const tokens = JWTService.generateTokens({
        userId: (user._id as any).toString(),
        email: user.email,
      });

      // Save refresh token
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
          },
          tokens,
        },
      });
    } catch (error) {
      logger.error("Signin error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async requestOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Generate new OTP
      const otpCode = user.generateOTP();
      await user.save();

      // Send OTP email
      try {
        const html = EmailService.getOTPTemplate(user.name, otpCode);
        await EmailService.sendEmail(email, "Your Verification Code", html);

        res.status(200).json({
          success: true,
          message: "OTP sent to your email",
        });
      } catch (emailError) {
        logger.error("Failed to send OTP email:", emailError);
        res.status(500).json({
          success: false,
          message: "Failed to send OTP. Please try again.",
        });
      }
    } catch (error) {
      logger.error("Request OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async updateProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { name, phone } = req.body;
      const userId = req.user?._id;

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Update fields
      if (name) user.name = name;
      if (phone) user.phone = phone;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
          },
        },
      });
    } catch (error) {
      logger.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async getProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id;

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
          },
        },
      });
    } catch (error) {
      logger.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const users = await User.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  public static async getCart(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id;

      const user = await User.findById(userId)
        .populate({
          path: "cart.product",
          select: "name images",
        })
        .populate({
          path: "cart.variant",
          select: "name comparePrice sku",
        });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          cart: user.cart,
        },
      });
    } catch (error) {
      logger.error("Get cart error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async addToCart(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { productId, variantId, quantity } = req.body;
      const userId = req.user?._id;

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Check if item already exists in cart
      const existingItemIndex = user.cart.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.variant.toString() === variantId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        user.cart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        user.cart.push({
          product: productId,
          variant: variantId,
          quantity,
        });
      }

      await user.save();

      // Populate the cart data before returning
      const populatedUser = await User.findById(userId)
        .populate({
          path: "cart.product",
          select: "name images",
        })
        .populate({
          path: "cart.variant",
          select: "name comparePrice sku",
        });

      res.status(200).json({
        success: true,
        message: "Item added to cart successfully",
        data: {
          cart: populatedUser?.cart || [],
        },
      });
    } catch (error) {
      logger.error("Add to cart error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async updateCartItem(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { productId, variantId, quantity } = req.body;
      const userId = req.user?._id;

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const itemIndex = user.cart.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.variant.toString() === variantId
      );

      if (itemIndex === -1) {
        res.status(404).json({
          success: false,
          message: "Item not found in cart",
        });
        return;
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        user.cart.splice(itemIndex, 1);
      } else {
        // Update quantity
        user.cart[itemIndex].quantity = quantity;
      }

      await user.save();

      // Populate the cart data before returning
      const populatedUser = await User.findById(userId)
        .populate({
          path: "cart.product",
          select: "name images",
        })
        .populate({
          path: "cart.variant",
          select: "name comparePrice sku",
        });

      res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: {
          cart: populatedUser?.cart || [],
        },
      });
    } catch (error) {
      logger.error("Update cart error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async removeFromCart(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { productId, variantId } = req.body;
      const userId = req.user?._id;

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const itemIndex = user.cart.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.variant.toString() === variantId
      );

      if (itemIndex === -1) {
        res.status(404).json({
          success: false,
          message: "Item not found in cart",
        });
        return;
      }

      user.cart.splice(itemIndex, 1);
      await user.save();

      // Populate the cart data before returning
      const populatedUser = await User.findById(userId)
        .populate({
          path: "cart.product",
          select: "name images",
        })
        .populate({
          path: "cart.variant",
          select: "name comparePrice sku",
        });

      res.status(200).json({
        success: true,
        message: "Item removed from cart successfully",
        data: {
          cart: populatedUser?.cart || [],
        },
      });
    } catch (error) {
      logger.error("Remove from cart error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async clearCart(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id;

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      user.cart = [];
      await user.save();

      res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
        data: {
          cart: [],
        },
      });
    } catch (error) {
      logger.error("Clear cart error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, phone, isEmailVerified } = req.body;
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;
      await user.save();
      res
        .status(200)
        .json({ success: true, message: "User updated", data: { user } });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  public static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  //Admin routes
  public static async adminAddUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, isEmailVerified } = req.body;
      const user = new User({ name, email, phone, isEmailVerified });
      await user.save();
      res.status(200).json({ success: true, message: "User added" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  public static async adminUpdateUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, phone, isEmailVerified } = req.body;
      const user = await User.findByIdAndUpdate(id, {
        name,
        email,
        phone,
        isEmailVerified,
      });
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      res.status(200).json({ success: true, message: "User updated" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  public static async adminDeleteUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}
