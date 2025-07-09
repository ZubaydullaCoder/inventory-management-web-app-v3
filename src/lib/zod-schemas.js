// src/lib/zod-schemas.js

import { z } from "zod";
import { normalizeProductName } from "@/lib/utils";

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
    z.number().positive({ message: "Selling price must be a positive number." })
  ),
  purchasePrice: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().nonnegative({
      message: "Purchase price must be a positive number or zero.",
    })
  ),
  stock: z
    .preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().int().nonnegative()
    )
    .optional(),
  reorderPoint: z
    .preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().int().nonnegative()
    )
    .optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});
