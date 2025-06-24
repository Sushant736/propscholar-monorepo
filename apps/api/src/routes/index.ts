import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import variantRoutes from "./variantRoutes.js";
import orderRoutes from "./orderRoutes.js";

const router: ExpressRouter = Router();

// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/variants", variantRoutes);
router.use("/orders", orderRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API info route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PropScholar API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      categories: "/api/categories",
      products: "/api/products",
      variants: "/api/variants",
      orders: "/api/orders",
      health: "/api/health",
    },
    documentation: "Visit /api/health for API status",
  });
});

export default router;
