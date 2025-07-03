import { Request, Response } from "express";
import { User } from "../models/User.js";
import { JWTService } from "../utils/jwt.js";
import { EmailService } from "../services/emailService.js";
import { logger } from "../utils/logger.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export class AuthController {
  public static async checkEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      res.status(200).json({
        success: true,
        data: {
          exists: !!user,
          user: user
            ? {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
              }
            : null,
        },
      });
    } catch (error) {
      logger.error("Check email error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

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
        if(process.env.NODE_ENV === "development") {
          console.log("OTP Code:", otpCode);
        } else {
          const html = EmailService.getOTPTemplate(name, otpCode);
          await EmailService.sendEmail(email, "Your Verification Code", html);
        }
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

  public static async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        // Create a temporary user for OTP
        user = new User({
          name: "Temporary User", // Will be updated during signup
          email,
          phone: "",
        });
      }

      const otpCode = user.generateOTP();
      await user.save();

      try {
        if(process.env.NODE_ENV === "development") {
          console.log("OTP Code:", otpCode);
        } else {
          const html = EmailService.getOTPTemplate(user.name, otpCode);
          await EmailService.sendEmail(email, "Your Verification Code", html);
        }

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
      logger.error("Send OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, name } = req.body;

      const user = await User.findOne({ email }).select("+otpCode +otpExpires +refreshTokens");

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

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

      // Check if this is a new user (temporary user created during sendOTP)
      const isNewUser = user.name === "Temporary User";

      if (isNewUser) {
        // This is a new user, require name for signup
        if (!name) {
          res.status(400).json({
            success: false,
            message: "Name is required for new user signup",
            requiresSignup: true,
          });
          return;
        }

        // Update user with provided name
        user.name = name;
      }

      // Clear OTP and generate tokens
      user.otpCode = undefined;
      user.otpExpires = undefined;

      const tokens = JWTService.generateTokens({
        userId: String(user._id),
        email: user.email,
      });

      // Initialize refreshTokens array if it doesn't exist
      if (!user.refreshTokens) {
        user.refreshTokens = [];
      }
      
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      res.status(200).json({
        success: true,
        message: isNewUser
          ? "User registered and verified successfully"
          : "OTP verified successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isNewUser,
        },
      });
    } catch (error) {
      logger.error("OTP verification error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const decoded = JWTService.verifyRefreshToken(refreshToken);

      const user = await User.findById(decoded.userId).select("+refreshTokens");

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
        return;
      }

      // Generate new tokens
      const tokens = JWTService.generateTokens({
        userId: String(user._id),
        email: user.email,
      });

      // Remove old refresh token and add new one
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      logger.error("Refresh token error:", error);
      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  }

  public static async logout(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?._id;

      if (refreshToken) {
        const user = await User.findById(userId).select("+refreshTokens");
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(
            (token) => token !== refreshToken
          );
          await user.save();
        }
      }

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      logger.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async logoutAll(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id;

      await User.findByIdAndUpdate(userId, { refreshTokens: [] });

      res.status(200).json({
        success: true,
        message: "Logged out from all devices successfully",
      });
    } catch (error) {
      logger.error("Logout all error:", error);
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
      res.status(200).json({
        success: true,
        data: {
          user: req.user,
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
}
