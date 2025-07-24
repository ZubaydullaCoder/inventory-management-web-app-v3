// src/app/api/categories/cursor/route.js

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCategoriesByShopIdCursor } from "@/lib/data/categories";
import prisma from "@/lib/prisma";

/**
 * Handles GET requests to fetch categories with cursor-based pagination for the authenticated user's shop.
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    
    // Extract pagination parameters
    const cursor = searchParams.get("cursor") || null;
    const direction = searchParams.get("direction") || "forward";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50); // Cap at 50
    
    // Extract search parameter
    const search = searchParams.get("search") || "";

    // Validate direction parameter
    if (!["forward", "backward"].includes(direction)) {
      return NextResponse.json(
        { error: "Invalid direction parameter. Must be 'forward' or 'backward'." },
        { status: 400 }
      );
    }

    const paginatedData = await getCategoriesByShopIdCursor(shop.id, {
      cursor,
      direction,
      limit,
      search,
    });

    return NextResponse.json(paginatedData);
  } catch (error) {
    console.error("GET /api/categories/cursor Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
