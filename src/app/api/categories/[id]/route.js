// src/app/api/categories/[id]/route.js

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { categoryCreateSchema } from "@/lib/zod-schemas";
import { updateCategory, deleteCategory } from "@/lib/data/categories";
import prisma from "@/lib/prisma";

/**
 * Handles PUT requests to update a specific category.
 * @param {Request} request
 * @param {Object} params
 * @param {string} params.id - The category ID
 * @returns {Promise<NextResponse>}
 */
export async function PUT(request, { params }) {
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

    const { id: categoryId } = await params; // <-- Await params here
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

    const requestBody = await request.json();
    const validatedData = categoryCreateSchema.parse(requestBody);

    const updatedCategory = await updateCategory(
      categoryId,
      validatedData,
      shop.id
    );

    return NextResponse.json(updatedCategory);
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

    // Handle record not found errors (P2025)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    console.error("PUT /api/categories/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to delete a specific category.
 * Includes safety checks to prevent deletion of categories with assigned products.
 * @param {Request} request
 * @param {Object} params
 * @param {string} params.id - The category ID
 * @returns {Promise<NextResponse>}
 */
export async function DELETE(request, { params }) {
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

    const { id: categoryId } = await params; // <-- Await params here
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

    // Safety check: Prevent deletion if products are assigned to this category
    const productsUsingCategory = await prisma.product.count({
      where: {
        categoryId: categoryId,
        shopId: shop.id,
      },
    });

    if (productsUsingCategory > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. ${productsUsingCategory} product${
            productsUsingCategory > 1 ? "s are" : " is"
          } assigned to this category. Please reassign or delete the product${
            productsUsingCategory > 1 ? "s" : ""
          } first.`,
        },
        { status: 409 }
      );
    }

    const deletedCategory = await deleteCategory(categoryId, shop.id);

    return NextResponse.json(
      { message: "Category deleted successfully", category: deletedCategory },
      { status: 200 }
    );
  } catch (error) {
    // Handle record not found errors (P2025)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Handle foreign key constraint violations (P2003)
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Cannot delete category with assigned products. Remove products first.",
        },
        { status: 409 }
      );
    }

    console.error("DELETE /api/categories/[id] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
