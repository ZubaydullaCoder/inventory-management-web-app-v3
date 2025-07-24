// src/app/api/categories/[id]/usage/route.js

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkCategoryUsage } from "@/lib/data/categories";
import prisma from "@/lib/prisma";

/**
 * Handles GET requests to get category usage information.
 * Returns how many products are assigned to a specific category.
 * @param {Request} request
 * @param {Object} params
 * @param {string} params.id - The category ID
 * @returns {Promise<NextResponse>}
 */
export async function GET(request, { params }) {
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

    const categoryId = params.id;
    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Verify category exists and belongs to user's shop
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        shopId: shop.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get usage information
    const usageInfo = await checkCategoryUsage(categoryId, shop.id);

    return NextResponse.json(usageInfo);
  } catch (error) {
    console.error("GET /api/categories/[id]/usage Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
