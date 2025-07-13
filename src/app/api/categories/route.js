// src/app/api/categories/route.js

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { categoryCreateSchema } from "@/lib/zod-schemas";
import {
  getAllCategoriesByShopId,
  createCategory,
} from "@/lib/data/categories";
import prisma from "@/lib/prisma";

/**
 * Handles GET requests to fetch all categories for the authenticated user's shop.
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shopId = session.user.shopId;

    if (!shopId) {
      return NextResponse.json(
        { error: "Shop not found for user" },
        { status: 404 }
      );
    }

    const categories = await getAllCategoriesByShopId(shopId.id);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new category for the authenticated user's shop.
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shop = await prisma.shop.findUnique({
      where: { ownerId: session.user.id },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found for user" },
        { status: 404 }
      );
    }

    const requestBody = await request.json();
    const validatedData = categoryCreateSchema.parse(requestBody);

    const newCategory = await createCategory(validatedData, shop.id);

    // Return the newly created category object to support optimistic UI updates on the client.
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint violations (P2002)
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return NextResponse.json(
        { error: "A category with this name already exists." },
        { status: 409 }
      );
    }

    console.error("POST /api/categories Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
