// src/lib/zod-schemas.js

import { z } from "zod";
import { normalizeProductName, normalizeCategoryName } from "@/lib/utils";

/**
 * @description Zod schema for validating the input for creating a new product.
 * This is used in the API route to ensure data integrity.
 */
export const productCreateSchema = z.object({
  name: z.preprocess(
    (val) => normalizeProductName(val),
    z.string().min(1, { message: "Product name cannot be empty." })
  ),
  sellingPrice: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z
      .number()
      .int()
      .positive({ message: "Selling price must be a positive number." })
  ),
  purchasePrice: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().nonnegative({
      message: "Purchase price must be a positive number or zero.",
    })
  ),
  stock: z
    .preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().int().nonnegative()
    )
    .optional(),
  unit: z.string().optional(),
  reorderPoint: z
    .preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().int().nonnegative()
    )
    .optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});

/**
 * @description Zod schema for validating partial updates to a product.
 * This makes all fields optional to support PATCH-like semantics in PUT requests.
 */
export const productUpdateSchema = productCreateSchema.partial();

/**
 * @description Zod schema for validating category creation input.
 * This is used in the API route to ensure data integrity.
 */
export const categoryCreateSchema = z.object({
  name: z.preprocess(
    (val) => normalizeCategoryName(val),
    z.string().min(1, { message: "Category name cannot be empty." })
  ),
});
