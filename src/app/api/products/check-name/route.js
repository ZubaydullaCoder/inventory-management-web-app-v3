import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

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
    const name = searchParams.get("name");

    if (!name || name.trim() === "") {
      return NextResponse.json({ exists: false });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        shopId_name: {
          shopId: shop.id,
          name: name.trim(),
        },
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ exists: !!existingProduct });
  } catch (error) {
    console.error("GET /api/products/check-name Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
