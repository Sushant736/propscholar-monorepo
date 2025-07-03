import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import {
  validateRequest,
  emailValidation,
  otpValidation,
  refreshTokenValidation,
} from "../middleware/validation.js";
import {  otpLimiter } from "../middleware/rateLimiter.js";

const router: ExpressRouter = Router();

// Public routes
router.post(
  "/send-otp",
  otpLimiter,
  emailValidation,
  validateRequest,
  AuthController.sendOTP
);

router.post(
  "/verify-otp",
  otpLimiter,
  otpValidation,
  validateRequest,
  AuthController.verifyOTP
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
  