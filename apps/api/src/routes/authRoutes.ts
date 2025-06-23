import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import {
  validateRequest,
  signupValidation,
  loginValidation,
  otpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
  verifyEmailValidation,
} from "../middleware/validation.js";
import {
  authLimiter,
  passwordResetLimiter,
  otpLimiter,
  emailVerificationLimiter,
} from "../middleware/rateLimiter.js";

const router: ExpressRouter = Router();

// Public routes
router.post(
  "/signup",
  authLimiter,
  signupValidation,
  validateRequest,
  AuthController.signup
);

router.post(
  "/login",
  authLimiter,
  loginValidation,
  validateRequest,
  AuthController.login
);

router.post(
  "/verify-otp",
  otpLimiter,
  otpValidation,
  validateRequest,
  AuthController.verifyOTP
);

router.post(
  "/request-otp",
  otpLimiter,
  forgotPasswordValidation, // reusing email validation
  validateRequest,
  AuthController.requestOTP
);

router.post(
  "/verify-email",
  emailVerificationLimiter,
  verifyEmailValidation,
  validateRequest,
  AuthController.verifyEmail
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPasswordValidation,
  validateRequest,
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  resetPasswordValidation,
  validateRequest,
  AuthController.resetPassword
);

router.post(
  "/refresh-token",
  refreshTokenValidation,
  validateRequest,
  AuthController.refreshToken
);

// Protected routes
router.get("/profile", authenticate, AuthController.getProfile);

router.post("/logout", authenticate, AuthController.logout);

router.post("/logout-all", authenticate, AuthController.logoutAll);

export default router;
