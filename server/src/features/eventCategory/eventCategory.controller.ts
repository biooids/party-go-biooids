// src/features/eventCategory/eventCategory.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { eventCategoryService } from "./eventCategory.service.js";

class EventCategoryController {
  // Controller to create a new category
  create = asyncHandler(async (req: Request, res: Response) => {
    const category = await eventCategoryService.createCategory(req.body);
    res.status(201).json({
      status: "success",
      message: "Category created successfully.",
      data: { category },
    });
  });

  // Controller to get all categories
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await eventCategoryService.findAllCategories();
    res.status(200).json({
      status: "success",
      results: categories.length,
      data: { categories },
    });
  });

  // Controller to get a single category by its ID
  getOne = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const category = await eventCategoryService.findCategoryById(categoryId);
    res.status(200).json({
      status: "success",
      data: { category },
    });
  });

  // Controller to update a category
  update = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const updatedCategory = await eventCategoryService.updateCategory(
      categoryId,
      req.body
    );
    res.status(200).json({
      status: "success",
      message: "Category updated successfully.",
      data: { category: updatedCategory },
    });
  });

  // Controller to delete a category
  remove = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    await eventCategoryService.deleteCategory(categoryId);
    res.status(204).send();
  });
}

export const eventCategoryController = new EventCategoryController();
