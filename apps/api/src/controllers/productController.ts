import { Request, Response } from "express";
import { Product, IProduct } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { logger } from "../utils/logger.js";

export class ProductController {
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        description,
        images,
        category,
        tags,
        isActive,
        isFeatured,
        seoDescription,
        seoKeywords,
      } = req.body;

      // Check if category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        res.status(400).json({
          success: false,
          message: "Category not found",
        });
        return;
      }

      const product = new Product({
        name,
        description,
        images,
        category,
        tags,
        isActive,
        isFeatured,
        seoDescription,
        seoKeywords,
      });

      await product.save();

      // Add product to category
      categoryExists.products.push(product._id);
      await categoryExists.save();

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: {
          product,
        },
      });
    } catch (error) {
      logger.error("Create product error:", error);
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
        category,
        isActive,
        isFeatured,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = {};

      if (category) filter.category = category;
      if (isActive !== undefined) filter.isActive = isActive === "true";
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

      if (search) {
        filter.$text = { $search: search as string };
      }

      const sort: any = {};
      sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

      const products = await Product.find(filter)
        .populate("category", "name")
        .populate("variants")
        .skip(skip)
        .limit(Number(limit))
        .sort(sort);

      const total = await Product.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      logger.error("Get all products error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await Product.findById(id)
        .populate("category", "name description image")
        .populate(
          "variants",
          "name price sku stock weight dimensions attributes images"
        );

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          product,
        },
      });
    } catch (error) {
      logger.error("Get product by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        images,
        category,
        tags,
        isActive,
        isFeatured,
        seoDescription,
        seoKeywords,
      } = req.body;

      const product = await Product.findById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      // Check if category is being changed
      if (category && category !== product.category.toString()) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          res.status(400).json({
            success: false,
            message: "Category not found",
          });
          return;
        }

        // Remove product from old category
        const oldCategory = await Category.findById(product.category);
        if (oldCategory) {
          oldCategory.products = oldCategory.products.filter(
            (p) => p.toString() !== product._id.toString()
          );
          await oldCategory.save();
        }

        // Add product to new category
        categoryExists.products.push(product._id);
        await categoryExists.save();
      }

      // Update fields
      if (name) product.name = name;
      if (description) product.description = description;
      if (images) product.images = images;
      if (category) product.category = category;
      if (tags) product.tags = tags;
      if (isActive !== undefined) product.isActive = isActive;
      if (isFeatured !== undefined) product.isFeatured = isFeatured;
      if (seoDescription) product.seoDescription = seoDescription;
      if (seoKeywords) product.seoKeywords = seoKeywords;

      await product.save();

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: {
          product,
        },
      });
    } catch (error) {
      logger.error("Update product error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      // Remove product from category
      const category = await Category.findById(product.category);
      if (category) {
        category.products = category.products.filter(
          (p) => p.toString() !== product._id.toString()
        );
        await category.save();
      }

      await Product.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      logger.error("Delete product error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async toggleActive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      product.isActive = !product.isActive;
      await product.save();

      res.status(200).json({
        success: true,
        message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
        data: {
          product,
        },
      });
    } catch (error) {
      logger.error("Toggle product active error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async toggleFeatured(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      product.isFeatured = !product.isFeatured;
      await product.save();

      res.status(200).json({
        success: true,
        message: `Product ${product.isFeatured ? "marked as featured" : "removed from featured"} successfully`,
        data: {
          product,
        },
      });
    } catch (error) {
      logger.error("Toggle product featured error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
