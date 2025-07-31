// src/app/api/products/route.js

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { productCreateSchema } from "@/lib/zod-schemas";
import { createProduct, getProductsByShopIdCursor } from "@/lib/data/products";
import prisma from "@/lib/prisma";

/**
 * Handles GET requests to fetch a paginated list of products for the authenticated user's shop.
 * Uses cursor-based pagination for optimal performance.
 *
 * Query Parameters:
 * - cursor: string (optional) - Base64 encoded cursor for pagination
 * - direction: 'forward' | 'backward' (default: 'forward')
 * - limit: number (default: 10)
 * - sortBy: string (optional)
 * - sortOrder: 'asc' | 'desc' (optional)
 * - nameFilter: string (optional)
 * - categoryFilter: string (optional)
 * - enableFuzzySearch: boolean (default: true)
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.user?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Extract cursor pagination parameters
    const cursor = searchParams.get("cursor") || null;
    const direction = searchParams.get("direction") || "forward";
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "10", 10),
      100
    );

    // Extract common parameters
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const nameFilter = searchParams.get("nameFilter") || "";
    const categoryFilter = searchParams.get("categoryFilter") || "";
    const unitFilter = searchParams.get("unitFilter") || "";
    const dateRangeFilter = searchParams.get("dateRangeFilter") || "";
    const enableFuzzySearch = searchParams.get("enableFuzzySearch") !== "false";

    // Validate direction parameter
    if (!["forward", "backward"].includes(direction)) {
      return NextResponse.json(
        { error: "Invalid direction. Must be 'forward' or 'backward'" },
        { status: 400 }
      );
    }

    // Validate sort parameters
    const validSortFields = [
      "createdAt",
      "name",
      "sellingPrice",
      "purchasePrice",
      "stock",
      "category",
    ];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        {
          error: `Invalid sortBy. Must be one of: ${validSortFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    if (!["asc", "desc"].includes(sortOrder)) {
      return NextResponse.json(
        { error: "Invalid sortOrder. Must be 'asc' or 'desc'" },
        { status: 400 }
      );
    }

    const paginatedData = await getProductsByShopIdCursor(session.user.shopId, {
      cursor,
      direction,
      limit,
      sortBy,
      sortOrder,
      nameFilter,
      categoryFilter,
      unitFilter,
      dateRangeFilter,
      enableFuzzySearch,
    });

    return NextResponse.json(paginatedData);
  } catch (error) {
    console.error("GET /api/products Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new product for the authenticated user's shop.
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestBody = await request.json();
    const validatedData = productCreateSchema.parse(requestBody);

    const newProduct = await createProduct(validatedData, session.user.shopId);

    // Return the newly created product object to support optimistic UI updates on the client.
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    // Handle category authorization error
    if (error.message?.includes("Invalid category")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Handle Prisma unique constraint violations (P2002)
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return NextResponse.json(
        { error: "A product with this name already exists." },
        { status: 409 }
      );
    }

    console.error("POST /api/products Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
