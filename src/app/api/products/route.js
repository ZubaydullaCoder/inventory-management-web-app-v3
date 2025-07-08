// src/app/api/products/route.js

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { productCreateSchema } from "@/lib/zod-schemas";
import { createProduct, getProductsByShopId } from "@/lib/data/products";
import prisma from "@/lib/prisma";

/**
 * Handles GET requests to fetch a paginated list of products for the authenticated user's shop.
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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const paginatedData = await getProductsByShopId(shop.id, { page, limit });

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
    const validatedData = productCreateSchema.parse(requestBody);

    const newProduct = await createProduct(validatedData, shop.id);

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
