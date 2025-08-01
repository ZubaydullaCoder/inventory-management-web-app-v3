// src/app/api/categories/check-name/route.js

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isCategoryNameTaken } from "@/lib/data/categories";

/**
 * Checks if a category name already exists for the authenticated user's shop.
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawName = searchParams.get("name");
    const excludeId = searchParams.get("excludeId");

    if (!rawName) {
      return NextResponse.json({ exists: false });
    }

    // Find the shop for the user
    const shopId = await (async () => {
      const prisma = (await import("@/lib/prisma")).default;
      const shop = await prisma.shop.findUnique({
        where: { ownerId: session.user.id },
      });
      return shop?.id || null;
    })();

    if (!shopId) {
      return NextResponse.json(
        { error: "Shop not found for user" },
        { status: 404 }
      );
    }

    // Pass excludeId to data layer
    const exists = await isCategoryNameTaken(shopId, rawName, excludeId);

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("GET /api/categories/check-name Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
