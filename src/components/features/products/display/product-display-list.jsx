"use client";

import * as React from "react";
import { useDebounce } from "use-debounce";
import { DataTable } from "@/components/ui/data-table";
import { productColumns } from "./product-table-columns";
import { useGetProducts } from "@/hooks/use-product-queries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client component that displays a list of products in a data table.
 * Uses server-side sorting, filtering, and pagination.
 *
 * @param {Object} props
 * @param {Array} [props.initialData] - Initial product data from server
 * @param {number} [props.initialPage] - Initial page number
 * @param {number} [props.initialLimit] - Initial page size
 */
export default function ProductDisplayList({
  initialData = [],
  initialPage = 1,
  initialLimit = 10,
}) {
  // State for table operations
  const [pagination, setPagination] = React.useState({
    pageIndex: initialPage - 1,
    pageSize: initialLimit,
  });
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Convert TanStack Table state to API parameters with debounced filters
  const nameFilter = columnFilters.find((f) => f.id === "name")?.value || "";
  const categoryFilter =
    columnFilters.find((f) => f.id === "category")?.value || "";

  // Debounce filter values to reduce rapid API calls (300ms is optimal for search UX)
  const [debouncedNameFilter] = useDebounce(nameFilter, 300);
  const [debouncedCategoryFilter] = useDebounce(categoryFilter, 300);

  const apiParams = React.useMemo(() => {
    const params = {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    };

    // Add sorting parameters
    if (sorting.length > 0) {
      const sort = sorting[0];
      params.sortBy = sort.id;
      params.sortOrder = sort.desc ? "desc" : "asc";
    }

    // Add debounced filtering parameters
    if (debouncedNameFilter) {
      params.nameFilter = debouncedNameFilter;
    }

    if (debouncedCategoryFilter) {
      params.categoryFilter = debouncedCategoryFilter;
    }

    return params;
  }, [pagination, sorting, debouncedNameFilter, debouncedCategoryFilter]);

  // Fetch data with current parameters
  const { data: productsData, isLoading, error } = useGetProducts(apiParams);

  // Use server data if available, fallback to initial data
  const products = productsData?.products || (isLoading ? [] : initialData);
  const totalProducts = productsData?.totalProducts || initialData.length;
  const pageCount = Math.ceil(totalProducts / pagination.pageSize);

  // Handle state changes
  const handleStateChange = React.useMemo(
    () => ({
      onPaginationChange: setPagination,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility, // <-- ADD THIS LINE
    }),
    []
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load products: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading && !initialData.length) {
    return <ProductTableSkeleton />;
  }

  // Create skeleton data for loading overlay while preserving table structure
  const displayData =
    isLoading && products.length === 0
      ? Array.from({ length: pagination.pageSize }, (_, i) => ({
          id: `skeleton-${i}`,
          name: `skeleton-${i}`,
          sellingPrice: 0,
          purchasePrice: 0,
          stock: 0,
          unit: "",
          category: { name: "skeleton" },
          supplier: { name: "skeleton" },
          isLoading: true,
        }))
      : products;

  return (
    <DataTable
      columns={productColumns}
      data={displayData}
      state={{
        sorting,
        columnVisibility,
        rowSelection,
        columnFilters,
        pagination,
      }}
      onStateChange={handleStateChange}
      manualPagination={true}
      manualSorting={true}
      manualFiltering={true}
      pageCount={pageCount}
      showToolbar={true}
      isLoading={isLoading} // Pass loading state to DataTable for selective skeletons
    />
  );
}

/**
 * Skeleton component for loading state.
 */
function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[40px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
