"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { productColumns } from "./product-table-columns";
import { useGetProducts } from "@/hooks/use-product-queries";
import { useTableUrlState } from "@/hooks/use-table-url-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client component that displays a list of products in a data table.
 * Uses URL-driven state management for pagination, sorting, and filtering.
 * Automatically resets pagination when filters change and preserves state across page refreshes.
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
  // URL-driven state management with automatic pagination reset on filter changes
  const {
    tableState,
    apiParams,
    handlePaginationChange,
    handleSortingChange,
    handleColumnFiltersChange,
    validatePage,
    isFiltered,
  } = useTableUrlState({
    page: initialPage,
    limit: initialLimit,
    sortBy: "createdAt",
    sortOrder: "desc",
    nameFilter: "",
    categoryFilter: "",
  });

  // Additional table state for UI-only features
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Fetch data with URL-driven parameters
  const { data: productsData, isLoading, error } = useGetProducts(apiParams);

  // Use server data if available, fallback to initial data
  const products = productsData?.products || (isLoading ? [] : initialData);
  const totalProducts = productsData?.totalProducts || initialData.length;
  const pageCount = Math.ceil(totalProducts / tableState.pagination.pageSize);

  // Validate current page when data changes
  React.useEffect(() => {
    if (productsData && pageCount > 0) {
      validatePage(pageCount);
    }
  }, [productsData, pageCount, validatePage]);

  // Handle state changes for TanStack Table
  const handleStateChange = React.useMemo(
    () => ({
      onPaginationChange: handlePaginationChange,
      onSortingChange: handleSortingChange,
      onColumnFiltersChange: handleColumnFiltersChange,
      onColumnVisibilityChange: setColumnVisibility,
    }),
    [handlePaginationChange, handleSortingChange, handleColumnFiltersChange]
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
      ? Array.from({ length: tableState.pagination.pageSize }, (_, i) => ({
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
        sorting: tableState.sorting,
        columnVisibility,
        rowSelection,
        columnFilters: tableState.columnFilters,
        pagination: tableState.pagination,
      }}
      onStateChange={handleStateChange}
      manualPagination={true}
      manualSorting={true}
      manualFiltering={true}
      pageCount={pageCount}
      showToolbar={true}
      isLoading={isLoading}
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
