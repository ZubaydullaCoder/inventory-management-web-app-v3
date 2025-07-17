import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cachedProductQueries } from "@/lib/cache/react-cache";
import ProductDisplayList from "@/components/features/products/display/product-display-list";

/**
 * Server component for the products listing page.
 * Fetches initial product data and renders the client-side table.
 */
export default async function ProductsPage({ searchParams }) {
  // Authenticate the user and get session
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { page: searchParamsPage, limit: searchParamsLimit } =
    (await searchParams) || {};

  // Get pagination parameters from URL
  const page = Number(searchParamsPage) || 1;
  const limit = Number(searchParamsLimit) || 10;

  // Fetch initial product data server-side
  let initialData = [];
  let error = null;

  try {
    const result = await cachedProductQueries.getProductsByShopId(
      session.user.shopId,
      {
        page,
        limit,
      }
    );
    initialData = result.products;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    error = err.message;
  }

  return (
    <div className="flex flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory and pricing.
          </p>
        </div>
      </div>

      {error ? (
        <div className="flex h-[450px] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Failed to load products</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <ProductDisplayList
          initialData={initialData}
          initialPage={page}
          initialLimit={limit}
        />
      )}
    </div>
  );
}

/**
 * Page metadata
 */
export const metadata = {
  title: "Products",
  description: "Manage your product inventory and pricing.",
};
