import { Router } from "express";
import { OrderController } from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Admin routes (you can add admin middleware later)
router.patch("/:id/status", generalLimiter, OrderController.updateStatus);

// Admin non-auth route for fetching all orders
router.get("/admin", generalLimiter, OrderController.adminGetAllOrders);

// Admin analytics route (no auth for now)
router.get(
  "/admin-analytics",
  generalLimiter,
  OrderController.getAdminAnalytics
);

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
router.get(
  "/:orderId/payment-status",
  authenticate,
  generalLimiter,
  OrderController.checkPaymentStatus
);
router.post(
  "/payment/callback",
  generalLimiter,
  OrderController.handlePaymentCallback
);

export default router;
