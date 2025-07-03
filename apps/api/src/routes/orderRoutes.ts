import { Router } from "express";
import { OrderController } from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Protected routes (user orders)
router.get("/", authenticate, generalLimiter, OrderController.getAll);
router.get(
  "/stats",
  authenticate,
  generalLimiter,
  OrderController.getOrderStats
);
router.get("/:id", authenticate, generalLimiter, OrderController.getById);
router.post("/", authenticate, generalLimiter, OrderController.create);
router.patch(
  "/:id/cancel",
  authenticate,
  generalLimiter,
  OrderController.cancelOrder
);

// Payment related routes
router.get("/:id/payment-status", authenticate, generalLimiter, OrderController.checkPaymentStatus);
router.post("/payment/callback", generalLimiter, OrderController.handlePaymentCallback);

// Admin routes (you can add admin middleware later)
router.patch("/:id/status", generalLimiter, OrderController.updateStatus);

export default router;
