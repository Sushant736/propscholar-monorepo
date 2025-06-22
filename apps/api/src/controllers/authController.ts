import { Request, Response } from 'express';
import { User, IUserDocument } from '../models/User.js';
import { JWTService } from '../utils/jwt.js';
import { EmailService } from '../services/emailService.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AuthController {
  public static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { phone }] 
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: existingUser.email === email 
            ? 'Email already registered' 
            : 'Phone number already registered'
        });
        return;
      }

      // Create new user
      const user = new User({
        name,
        email,
        phone,
        password
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send welcome email with verification link
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email?token=${verificationToken}`;
      
      try {
        const html = EmailService.getWelcomeTemplate(name, verificationLink);
        await EmailService.sendEmail(email, 'Welcome to PropScholar!', html);
      } catch (emailError) {
        console.error('[ERROR] Failed to send welcome email:', emailError);
      }

      // Generate tokens
      const tokens = JWTService.generateTokens({
        userId: (user._id as any).toString(),
        email: user.email
      });

      // Save refresh token
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
          },
          tokens
        }
      });

    } catch (error) {
      console.error('[ERROR] Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, otp } = req.body;

      // Find user and include password for verification
      const user = await User.findOne({ email }).select('+password +otpCode +otpExpires');

      if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Check if OTP is provided
      if (otp) {
        // Verify OTP
        if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
          res.status(400).json({
            success: false,
            message: 'OTP has expired. Please request a new one.'
          });
          return;
        }

        if (user.otpCode !== otp) {
          res.status(400).json({
            success: false,
            message: 'Invalid OTP'
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
          await EmailService.sendEmail(email, 'Your Login Verification Code', html);

          res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please verify to complete login.',
            requiresOTP: true
          });
          return;
        } catch (emailError) {
          console.error('[ERROR] Failed to send OTP email:', emailError);
          res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
          });
          return;
        }
      }

      // Generate tokens after successful OTP verification
      const tokens = JWTService.generateTokens({
        userId: (user._id as any).toString(),
        email: user.email
      });

      // Save refresh token
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
          },
          tokens
        }
      });

    } catch (error) {
      console.error('[ERROR] Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      const user = await User.findOne({ email }).select('+otpCode +otpExpires');

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
        res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new one.'
        });
        return;
      }

      if (user.otpCode !== otp) {
        res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
        return;
      }

      // Clear OTP and generate tokens
      user.otpCode = undefined;
      user.otpExpires = undefined;

      const tokens = JWTService.generateTokens({
        userId: (user._id as any).toString(),
        email: user.email
      });

      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
          },
          tokens
        }
      });

    } catch (error) {
      console.error('[ERROR] OTP verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
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
          message: 'User not found'
        });
        return;
      }

      const otpCode = user.generateOTP();
      await user.save();

      try {
        const html = EmailService.getOTPTemplate(user.name, otpCode);
        await EmailService.sendEmail(email, 'Your Login Verification Code', html);

        res.status(200).json({
          success: true,
          message: 'OTP sent to your email'
        });
      } catch (emailError) {
        console.error('[ERROR] Failed to send OTP email:', emailError);
        res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again.'
        });
      }

    } catch (error) {
      console.error('[ERROR] Request OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() }
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
        return;
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error) {
      console.error('[ERROR] Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        // Don't reveal if email exists or not
        res.status(200).json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
        return;
      }

      const resetToken = user.generatePasswordResetToken();
      await user.save();

      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;

      try {
        const html = EmailService.getPasswordResetTemplate(user.name, resetLink);
        await EmailService.sendEmail(email, 'Reset Your Password', html);

        res.status(200).json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      } catch (emailError) {
        console.error('[ERROR] Failed to send password reset email:', emailError);
        res.status(500).json({
          success: false,
          message: 'Failed to send password reset email. Please try again.'
        });
      }

    } catch (error) {
      console.error('[ERROR] Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
        return;
      }

      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      // Clear all refresh tokens for security
      user.refreshTokens = [];
      await user.save();

      try {
        const html = EmailService.getPasswordChangedTemplate(user.name);
        await EmailService.sendEmail(user.email, 'Password Changed Successfully', html);
      } catch (emailError) {
        console.error('[ERROR] Failed to send password changed email:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('[ERROR] Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?._id;

      const user = await User.findById(userId).select('+password');

      if (!user || !(await user.comparePassword(currentPassword))) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
        return;
      }

      user.password = newPassword;
      await user.save();

      try {
        const html = EmailService.getPasswordChangedTemplate(user.name);
        await EmailService.sendEmail(user.email, 'Password Changed Successfully', html);
      } catch (emailError) {
        console.error('[ERROR] Failed to send password changed email:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('[ERROR] Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const decoded = JWTService.verifyRefreshToken(refreshToken);
      
      const user = await User.findById(decoded.userId).select('+refreshTokens');

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
        return;
      }

      // Generate new tokens
      const tokens = JWTService.generateTokens({
        userId: (user._id as any).toString(),
        email: user.email
      });

      // Remove old refresh token and add new one
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: { tokens }
      });

    } catch (error) {
      console.error('[ERROR] Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }

  public static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?._id;

      if (refreshToken) {
        const user = await User.findById(userId).select('+refreshTokens');
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
          await user.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('[ERROR] Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public static async logoutAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      await User.findByIdAndUpdate(userId, { refreshTokens: [] });

      res.status(200).json({
        success: true,
        message: 'Logged out from all devices successfully'
      });

    } catch (error) {
      console.error('[ERROR] Logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('[ERROR] Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
} 