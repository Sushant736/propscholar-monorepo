import express from "express";
import { OrderController } from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/create", authenticate, OrderController.createOrderFromCart);
router.get("/", authenticate, OrderController.getAllOrders);
router.get("/:id", authenticate, OrderController.getOrderById);
router.put("/:id/cancel", authenticate, OrderController.cancelOrder);
router.get("/:orderId/payment-status", authenticate, OrderController.checkPaymentStatus);

// Public routes (for payment gateway callbacks)
router.post("/payment/callback", OrderController.handlePaymentCallback);

export default router; 