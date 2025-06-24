import { Request, Response } from "express";
import { Variant, IVariantDocument } from "../models/Variant.js";
import { Product } from "../models/Product.js";
import { logger } from "../utils/logger.js";

export class VariantController {
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, comparePrice, costPrice, product } = req.body;

      // Check if product exists
      const productExists = await Product.findById(product);
      if (!productExists) {
        res.status(400).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      const variant = new Variant({
        name,
        comparePrice,
        costPrice,
        product,
      });

      await variant.save();

      // Add variant to product
      productExists.variants.push(variant._id as any);
      await productExists.save();

      res.status(201).json({
        success: true,
        message: "Variant created successfully",
        data: {
          variant,
        },
      });
    } catch (error) {
      logger.error("Create variant error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        product,
        isActive,
        minPrice,
        maxPrice,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = {};

      if (product) filter.product = product;
      if (isActive !== undefined) filter.isActive = isActive === "true";
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const sort: any = {};
      sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

      const variants = await Variant.find(filter)
        .populate("product", "name images")
        .skip(skip)
        .limit(Number(limit))
        .sort(sort);

      const total = await Variant.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          variants,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      logger.error("Get all variants error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const variant = await Variant.findById(id).populate(
        "product",
        "name images description"
      );

      if (!variant) {
        res.status(404).json({
          success: false,
          message: "Variant not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          variant,
        },
      });
    } catch (error) {
      logger.error("Get variant by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, comparePrice, costPrice, product, isActive } = req.body;

      const variant = await Variant.findById(id);

      if (!variant) {
        res.status(404).json({
          success: false,
          message: "Variant not found",
        });
        return;
      }

      // Check if product is being changed
      if (product && product !== variant.product.toString()) {
        const productExists = await Product.findById(product);
        if (!productExists) {
          res.status(400).json({
            success: false,
            message: "Product not found",
          });
          return;
        }

        // Remove variant from old product
        const oldProduct = await Product.findById(variant.product);
        if (oldProduct) {
          oldProduct.variants = oldProduct.variants.filter(
            (v) => v.toString() !== (variant._id as any).toString()
          );
          await oldProduct.save();
        }

        // Add variant to new product
        productExists.variants.push(variant._id as any);
        await productExists.save();
      }

      // Update fields
      if (name) variant.name = name;
      if (comparePrice !== undefined) variant.comparePrice = comparePrice;
      if (costPrice !== undefined) variant.costPrice = costPrice;
      if (product) variant.product = product;
      if (isActive !== undefined) variant.isActive = isActive;

      await variant.save();

      res.status(200).json({
        success: true,
        message: "Variant updated successfully",
        data: {
          variant,
        },
      });
    } catch (error) {
      logger.error("Update variant error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const variant = await Variant.findById(id);

      if (!variant) {
        res.status(404).json({
          success: false,
          message: "Variant not found",
        });
        return;
      }

      // Remove variant from product
      const product = await Product.findById(variant.product);
      if (product) {
        product.variants = product.variants.filter(
          (v) => v.toString() !== (variant._id as any).toString()
        );
        await product.save();
      }

      await Variant.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Variant deleted successfully",
      });
    } catch (error) {
      logger.error("Delete variant error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async toggleActive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const variant = await Variant.findById(id);

      if (!variant) {
        res.status(404).json({
          success: false,
          message: "Variant not found",
        });
        return;
      }

      variant.isActive = !variant.isActive;
      await variant.save();

      res.status(200).json({
        success: true,
        message: `Variant ${variant.isActive ? "activated" : "deactivated"} successfully`,
        data: {
          variant,
        },
      });
    } catch (error) {
      logger.error("Toggle variant active error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      const variant = await Variant.findById(id);

      if (!variant) {
        res.status(404).json({
          success: false,
          message: "Variant not found",
        });
        return;
      }

      await variant.save();

      res.status(200).json({
        success: true,
        message: "Stock updated successfully",
        data: {
          variant,
        },
      });
    } catch (error) {
      logger.error("Update stock error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
