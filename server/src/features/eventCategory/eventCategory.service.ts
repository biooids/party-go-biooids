// src/features/eventCategory/eventCategory.service.ts

import EventCategory from "./eventCategory.model.js";
import {
  CreateCategoryInputDto,
  UpdateCategoryInputDto,
} from "./eventCategory.types.js";
import { createHttpError } from "../../utils/error.factory.js";

export class EventCategoryService {
  /**
   * Creates a new event category.
   * @param input - The category data.
   */
  async createCategory(input: CreateCategoryInputDto) {
    try {
      const category = await EventCategory.create(input);
      return category.toObject();
    } catch (error: any) {
      // Handle the case where the category name is not unique.
      if (error.code === 11000) {
        throw createHttpError(
          409,
          `A category with the name '${input.name}' already exists.`
        );
      }
      throw error;
    }
  }

  /**
   * Finds all event categories.
   */
  async findAllCategories() {
    return EventCategory.find().sort({ name: 1 }).lean();
  }

  /**
   * Finds a single event category by its ID.
   * @param categoryId - The ID of the category.
   */
  async findCategoryById(categoryId: string) {
    const category = await EventCategory.findById(categoryId).lean();
    if (!category) {
      throw createHttpError(404, "Category not found.");
    }
    return category;
  }

  /**
   * Updates an existing event category.
   * @param categoryId - The ID of the category to update.
   * @param updateData - The new data for the category.
   */
  async updateCategory(categoryId: string, updateData: UpdateCategoryInputDto) {
    const category = await EventCategory.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true }
    ).lean();

    if (!category) {
      throw createHttpError(404, "Category not found.");
    }
    return category;
  }

  /**
   * Deletes an event category.
   * @param categoryId - The ID of the category to delete.
   */
  async deleteCategory(categoryId: string) {
    const result = await EventCategory.findByIdAndDelete(categoryId);
    if (!result) {
      throw createHttpError(404, "Category not found.");
    }
    // Note: In a more complex app, you might prevent deleting a category
    // if it's currently being used by any events.
    return { message: "Category deleted successfully." };
  }
}

export const eventCategoryService = new EventCategoryService();
