import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public routes
router.post("/signup", authLimiter, UserController.signup);
router.post("/signin", authLimiter, UserController.signin);
router.post("/request-otp", otpLimiter, UserController.requestOTP);

// Get all users (paginated, for admin panel)
router.get("/", UserController.getAll);
// Update user (admin)
router.put("/:id", UserController.updateUser);
// Delete user (admin)
router.delete("/:id", UserController.deleteUser);

// Protected routes
router.get("/profile", authenticate, UserController.getProfile);
router.put("/profile", authenticate, UserController.updateProfile);

//Add user (admin)
router.post("/", UserController.adminAddUser);
router.put("/:id", UserController.adminUpdateUser);
router.delete("/:id", UserController.adminDeleteUser);

// Cart routes
router.get("/cart", authenticate, UserController.getCart);
router.post("/cart/add", authenticate, UserController.addToCart);
router.put("/cart/update", authenticate, UserController.updateCartItem);
router.delete("/cart/remove", authenticate, UserController.removeFromCart);
router.delete("/cart/clear", authenticate, UserController.clearCart);

export default router;
