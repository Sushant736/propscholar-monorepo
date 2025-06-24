import { Router } from "express";
import { ProductController } from "../controllers/productController.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public routes
router.get("/", generalLimiter, ProductController.getAll);
router.get("/:id", generalLimiter, ProductController.getById);

// Admin routes (you can add admin middleware later)
router.post("/", generalLimiter, ProductController.create);
router.put("/:id", generalLimiter, ProductController.update);
router.delete("/:id", generalLimiter, ProductController.delete);
router.patch(
  "/:id/toggle-active",
  generalLimiter,
  ProductController.toggleActive
);
router.patch(
  "/:id/toggle-featured",
  generalLimiter,
  ProductController.toggleFeatured
);

export default router;
