// src/app/api/products/units/route.js

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * Handles GET requests to fetch unique units from products for the authenticated user's shop.
 * Returns units with their product counts for filtering purposes.
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

    // Get unique units with product counts using Prisma aggregation
    const unitStats = await prisma.product.groupBy({
      by: ['unit'],
      where: {
        shopId: session.user.shopId,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc', // Order by most used units first
        },
      },
    });

    // Transform the results to the expected format
    const unitsWithCounts = unitStats.map(stat => ({
      unit: stat.unit, // This will be null for products without units
      productCount: stat._count.id,
    }));

    return NextResponse.json(unitsWithCounts);
  } catch (error) {
    console.error("GET /api/products/units Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
