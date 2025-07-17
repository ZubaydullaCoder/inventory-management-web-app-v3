import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProductsByShopIdCursor } from "@/lib/data/products";

/**
 * GET /api/products/cursor
 * Fetches products using cursor-based pagination.
 * Better performance than offset-based pagination for large datasets.
 *
 * Query Parameters:
 * - cursor: string (optional) - Base64 encoded cursor for pagination
 * - direction: 'forward' | 'backward' (default: 'forward')
 * - limit: number (default: 10)
 * - sortBy: string (optional)
 * - sortOrder: 'asc' | 'desc' (optional)
 * - nameFilter: string (optional)
 * - categoryFilter: string (optional)
 * - enableFuzzySearch: boolean (default: true)
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.user?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Extract and validate pagination parameters
    const cursor = searchParams.get("cursor") || null;
    const direction = searchParams.get("direction") || "forward";
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "10", 10),
      100
    ); // Cap at 100

    // Extract filtering and sorting parameters
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const nameFilter = searchParams.get("nameFilter") || "";
    const categoryFilter = searchParams.get("categoryFilter") || "";
    const enableFuzzySearch = searchParams.get("enableFuzzySearch") !== "false";

    // Validate direction parameter
    if (!["forward", "backward"].includes(direction)) {
      return NextResponse.json(
        { error: "Invalid direction. Must be 'forward' or 'backward'" },
        { status: 400 }
      );
    }

    // Validate sort parameters
    const validSortFields = [
      "createdAt",
      "name",
      "sellingPrice",
      "purchasePrice",
      "stock",
      "category",
    ];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        {
          error: `Invalid sortBy. Must be one of: ${validSortFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    if (!["asc", "desc"].includes(sortOrder)) {
      return NextResponse.json(
        { error: "Invalid sortOrder. Must be 'asc' or 'desc'" },
        { status: 400 }
      );
    }

    // Fetch products using cursor pagination
    const result = await getProductsByShopIdCursor(session.user.shopId, {
      cursor,
      direction,
      limit,
      sortBy,
      sortOrder,
      nameFilter,
      categoryFilter,
      enableFuzzySearch,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/products/cursor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
