"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { productColumns } from "./product-table-columns";
import {
  useGetProducts,
  useGetProductsCursor,
} from "@/hooks/use-product-queries";
import { useTableUrlState } from "@/hooks/use-table-url-state";
import { useTableCursorUrlState } from "@/hooks/use-table-cursor-url-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Client component that displays a list of products in a data table.
 * Uses URL-driven state management for pagination, sorting, and filtering.
 * Automatically resets pagination when filters change and preserves state across page refreshes.
 *
 * Loading Strategy: Uses selective skeleton loading where only dynamic data cells show skeleton
 * while static elements (headers, toolbar, pagination) remain functional throughout loading states.
 * This provides a superior UX compared to full-table skeleton overlays.
 *
 * @param {Object} props
 * @param {Array} [props.initialData] - Initial product data from server
 * @param {number} [props.initialPage] - Initial page number
 * @param {number} [props.initialLimit] - Initial page size
 * @param {boolean} [props.useCursorPagination] - Whether to use cursor-based pagination (default: true for better performance)
 */
export default function ProductDisplayList({
  initialData = [],
  initialPage = 1,
  initialLimit = 10,
  useCursorPagination = true, // Enable cursor pagination by default for better performance
}) {
  // Choose pagination strategy based on prop
  const paginationHook = useCursorPagination
    ? useTableCursorUrlState
    : useTableUrlState;

  // URL-driven state management with automatic pagination reset on filter changes
  const paginationConfig = useCursorPagination
    ? {
        cursor: null,
        direction: "forward",
        limit: initialLimit,
        sortBy: "createdAt",
        sortOrder: "desc",
        nameFilter: "",
        categoryFilter: "",
      }
    : {
        page: initialPage,
        limit: initialLimit,
        sortBy: "createdAt",
        sortOrder: "desc",
        nameFilter: "",
        categoryFilter: "",
      };

  const {
    tableState,
    apiParams,
    handleCursorChange,
    handlePaginationChange,
    handleSortingChange,
    handleColumnFiltersChange,
    handlePageSizeChange,
    validatePage,
    isFiltered,
  } = paginationHook(paginationConfig);

  // Additional table state for UI-only features
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Fetch data with URL-driven parameters using appropriate hook
  const dataHook = useCursorPagination ? useGetProductsCursor : useGetProducts;
  const { data: productsData, isLoading, error } = dataHook(apiParams);

  // Use server data if available, fallback to initial data
  const products = productsData?.products || (isLoading ? [] : initialData);
  const totalProducts = productsData?.totalProducts || initialData.length;

  // Handle different pagination metadata
  const paginationMetadata = useCursorPagination
    ? {
        // Cursor pagination metadata
        prevCursor: productsData?.prevCursor || null,
        nextCursor: productsData?.nextCursor || null,
        hasPrevPage: productsData?.hasPrevPage || false,
        hasNextPage: productsData?.hasNextPage || false,
        currentPageSize: apiParams.limit,
      }
    : {
        // Offset pagination metadata
        pageCount: Math.ceil(totalProducts / tableState.pagination.pageSize),
      };

  // Validate current page when data changes (offset pagination only)
  React.useEffect(() => {
    if (
      !useCursorPagination &&
      productsData &&
      paginationMetadata.pageCount > 0
    ) {
      validatePage(paginationMetadata.pageCount);
    }
  }, [
    useCursorPagination,
    productsData,
    paginationMetadata.pageCount,
    validatePage,
  ]);

  // Handle state changes for TanStack Table
  const handleStateChange = React.useMemo(
    () => ({
      onPaginationChange: useCursorPagination
        ? undefined
        : handlePaginationChange,
      onSortingChange: handleSortingChange,
      onColumnFiltersChange: handleColumnFiltersChange,
      onColumnVisibilityChange: setColumnVisibility,
    }),
    [
      useCursorPagination,
      handlePaginationChange,
      handleSortingChange,
      handleColumnFiltersChange,
    ]
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

  // Create skeleton data for selective loading while preserving table structure
  const displayData =
    isLoading && products.length === 0
      ? Array.from(
          { length: apiParams.limit || tableState.cursor?.pageSize || 10 },
          (_, i) => ({
            id: `skeleton-${i}`,
            name: `skeleton-${i}`,
            sellingPrice: 0,
            purchasePrice: 0,
            stock: 0,
            unit: "",
            category: { name: "skeleton" },
            supplier: { name: "skeleton" },
            isLoading: true, // Flag to identify skeleton rows
          })
        )
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
        pagination: useCursorPagination ? undefined : tableState.pagination,
      }}
      onStateChange={handleStateChange}
      manualPagination={true}
      manualSorting={true}
      manualFiltering={true}
      // Props for offset pagination
      pageCount={useCursorPagination ? undefined : paginationMetadata.pageCount}
      // Props for cursor pagination
      useCursorPagination={useCursorPagination}
      cursorPaginationState={
        useCursorPagination ? paginationMetadata : undefined
      }
      onCursorChange={useCursorPagination ? handleCursorChange : undefined}
      onPageSizeChange={useCursorPagination ? handlePageSizeChange : undefined}
      totalItems={totalProducts}
      // Common props
      showToolbar={true}
      isLoading={isLoading} // Pass loading state for selective skeleton rendering
    />
  );
}
