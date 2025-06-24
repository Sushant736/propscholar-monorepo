import { Router } from "express";
import { CategoryController } from "../controllers/categoryController.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public routes
router.get("/", generalLimiter, CategoryController.getAll);
router.get("/:id", generalLimiter, CategoryController.getById);

// Admin routes (you can add admin middleware later)
router.post("/", generalLimiter, CategoryController.create);
router.put("/:id", generalLimiter, CategoryController.update);
router.delete("/:id", generalLimiter, CategoryController.delete);
router.patch(
  "/:id/toggle-active",
  generalLimiter,
  CategoryController.toggleActive
);

export default router;
