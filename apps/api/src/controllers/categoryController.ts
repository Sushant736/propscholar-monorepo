import { Request, Response } from "express";
import { Category } from "../models/Category.js";
import { logger } from "../utils/logger.js";

export class CategoryController {
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, image } = req.body;

      // Check if category already exists
      const existingCategory = await Category.findOne({ name });

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
        return;
      }

      const category = new Category({
        name,
        description,
        image,
      });

      await category.save();

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: {
          category,
        },
      });
    } catch (error) {
      logger.error("Create category error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, isActive } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = {};
      if (isActive !== undefined) {
        filter.isActive = isActive === "true";
      }

      const categories = await Category.find(filter)
        .populate("products", "name images")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const total = await Category.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          categories,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      logger.error("Get all categories error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await Category.findById(id).populate(
        "products",
        "name images description"
      );

      if (!category) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          category,
        },
      });
    } catch (error) {
      logger.error("Get category by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, image, isActive } = req.body;

      const category = await Category.findById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }

      // Check if name is being changed and if it conflicts with existing category
      if (name && name !== category.name) {
        const existingCategory = await Category.findOne({
          name,
          _id: { $ne: id },
        });
        if (existingCategory) {
          res.status(400).json({
            success: false,
            message: "Category with this name already exists",
          });
          return;
        }
      }

      // Update fields
      if (name) category.name = name;
      if (description !== undefined) category.description = description;
      if (image) category.image = image;
      if (isActive !== undefined) category.isActive = isActive;

      await category.save();

      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: {
          category,
        },
      });
    } catch (error) {
      logger.error("Update category error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }

      // Check if category has products
      if (category.products.length > 0) {
        res.status(400).json({
          success: false,
          message: "Cannot delete category with existing products",
        });
        return;
      }

      await Category.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      logger.error("Delete category error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public static async toggleActive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }

      category.isActive = !category.isActive;
      await category.save();

      res.status(200).json({
        success: true,
        message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
        data: {
          category,
        },
      });
    } catch (error) {
      logger.error("Toggle category active error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
