"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { productColumns } from "./product-table-columns";
import { ProductBulkActions } from "../product-bulk-actions";

/**
 * Container component for the product table.
 * Handles the rendering of the DataTable with skeleton loading logic.
 *
 * @param {Object} props
 * @param {Array} props.products - Product data to display
 * @param {Object} props.tableState - Table state including sorting, filters, pagination, and row selection
 * @param {Object} props.handleStateChange - State change handlers for the table including onRowSelectionChange
 * @param {Object} props.paginationMetadata - Pagination metadata (offset or cursor based)
 * @param {boolean} props.useCursorPagination - Whether to use cursor-based pagination
 * @param {Function} props.handleCursorChange - Handler for cursor changes (cursor pagination only)
 * @param {Function} props.handlePageSizeChange - Handler for page size changes (cursor pagination only)
 * @param {number} props.totalProducts - Total number of products (unfiltered)
 * @param {number} [props.filteredCount] - Total number of filtered products
 * @param {boolean} props.isLoading - Loading state
 * @param {number} props.skeletonRowCount - Number of skeleton rows to display when loading
 */
export default function ProductTableContainer({
  products,
  tableState,
  handleStateChange,
  paginationMetadata,
  useCursorPagination,
  handleCursorChange,
  handlePageSizeChange,
  totalProducts,
  filteredCount,
  isLoading,
  skeletonRowCount = 10,
}) {
  // Create skeleton data for selective loading while preserving table structure
  const displayData = React.useMemo(() => {
    if (isLoading && products.length === 0) {
      return Array.from({ length: skeletonRowCount }, (_, i) => ({
        id: `skeleton-${i}`,
        name: `skeleton-${i}`,
        sellingPrice: 0,
        purchasePrice: 0,
        stock: 0,
        unit: "",
        category: { name: "skeleton" },
        supplier: { name: "skeleton" },
        isLoading: true, // Flag to identify skeleton rows
      }));
    }
    return products;
  }, [isLoading, products, skeletonRowCount]);

  // Get selected products for the bottom action bar
  const selectedProducts = React.useMemo(() => {
    if (!tableState.rowSelection || Object.keys(tableState.rowSelection).length === 0) {
      return [];
    }
    
    return displayData.filter((product, index) => {
      return tableState.rowSelection[index] && !product.isLoading;
    });
  }, [displayData, tableState.rowSelection]);

  const handleClearSelection = React.useCallback(() => {
    if (handleStateChange.onRowSelectionChange) {
      handleStateChange.onRowSelectionChange({});
    }
  }, [handleStateChange]);

  return (
    <>
      <DataTable
        columns={productColumns}
        data={displayData}
        state={{
          sorting: tableState.sorting,
          columnFilters: tableState.columnFilters,
          pagination: useCursorPagination ? undefined : tableState.pagination,
          rowSelection: tableState.rowSelection,
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
        filteredCount={filteredCount}
        // Common props - remove bulk actions from toolbar
        showToolbar={true}
        bulkActionsComponent={null}
        isLoading={isLoading} // Pass loading state for selective skeleton rendering
      />
      
      {/* Bottom Action Bar */}
      <ProductBulkActions
        selectedProducts={selectedProducts}
        onClearSelection={handleClearSelection}
      />
    </>
  );
}
