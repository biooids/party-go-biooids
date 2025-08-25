// src/lib/features/eventCategory/eventCategoryTypes.ts

/**
 * The shape of a single event category object returned from the API.
 */
export interface EventCategory {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The shape of the API response when fetching all event categories.
 */
export interface GetAllCategoriesApiResponse {
  status: string;
  results: number;
  data: {
    categories: EventCategory[];
  };
}

/**

 * The shape of the data needed to create a new category (for an admin form).
 */
export interface CreateCategoryDto {
  name: string;
  description: string;
}
