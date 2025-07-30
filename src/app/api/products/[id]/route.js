// src/app/api/products/[id]/route.js

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { productCreateSchema, productUpdateSchema } from "@/lib/zod-schemas";
import { updateProduct } from "@/lib/data/products";
import prisma from "@/lib/prisma";

/**
 * Handles DELETE requests to remove a product for the authenticated user's shop.
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<NextResponse>}
 */
export async function DELETE(request, { params }) {
  const { id } = await params;
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

    const deletedProduct = await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(deletedProduct, { status: 200 });
  } catch (error) {
    // Handle Prisma record not found (P2025)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // TODO: Handle foreign key constraints, if applicable

    console.error("DELETE /api/products/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update an existing product for the authenticated user's shop.
 * @param {Request} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<NextResponse>}
 */
export async function PUT(request, { params }) {
  const { id } = await params;
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
    const validatedData = productUpdateSchema.parse(requestBody);

    const updatedProduct = await updateProduct(id, validatedData, shop.id);

    return NextResponse.json(updatedProduct, { status: 200 });
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

    // Handle Prisma record not found (P2025)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    console.error("PUT /api/products/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
