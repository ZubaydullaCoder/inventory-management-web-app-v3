import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isProductNameTaken } from "@/lib/data/products";

/**
 * Checks if a product name already exists for the authenticated user's shop.
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
    const excludeId = searchParams.get("excludeId"); // NEW

    if (!rawName) {
      return NextResponse.json({ exists: false });
    }

    const shopId = session.user.shopId;

    if (!shopId) {
      return NextResponse.json(
        { error: "Shop not found for user" },
        { status: 404 }
      );
    }

    // Pass excludeId to data layer
    const exists = await isProductNameTaken(shopId, rawName, excludeId);

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("GET /api/products/check-name Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
