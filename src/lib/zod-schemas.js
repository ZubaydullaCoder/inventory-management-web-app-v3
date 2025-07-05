// src/lib/zod-schemas.js

import { z } from "zod";

/**
 * @description Zod schema for validating the input for creating a new product.
 * This is used in the API route to ensure data integrity.
 */
export const productCreateSchema = z.object({
  name: z.string().min(1, { message: "Product name cannot be empty." }),
  sellingPrice: z
    .number()
    .positive({ message: "Selling price must be a positive number." }),
  purchasePrice: z
    .number()
    .nonnegative({
      message: "Purchase price must be a positive number or zero.",
    }),
  stock: z.number().int().nonnegative().optional(),
  reorderPoint: z.number().int().nonnegative().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});
