import { Router } from "express";
import { VariantController } from "../controllers/variantController.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public routes
router.get("/", generalLimiter, VariantController.getAll);
router.get("/:id", generalLimiter, VariantController.getById);

// Admin routes (you can add admin middleware later)
router.post("/", generalLimiter, VariantController.create);
router.put("/:id", generalLimiter, VariantController.update);
router.delete("/:id", generalLimiter, VariantController.delete);
router.patch(
  "/:id/toggle-active",
  generalLimiter,
  VariantController.toggleActive
);
router.patch("/:id/stock", generalLimiter, VariantController.updateStock);

export default router;
