"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useGetProducts } from "@/hooks/use-product-queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { productColumns } from "./product-table-columns";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client component that displays a list of products in a data table.
 * Hydrates TanStack Query with initial data from server component.
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
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: initialPage - 1,
    pageSize: initialLimit,
  });

  // Query with current pagination, sorting, and filtering
  const {
    data: productsData,
    isLoading,
    error,
  } = useGetProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    // Future: Add sorting and filtering params when API supports them
  });

  // Use initialData on first render, then switch to query data
  const products = productsData?.products || initialData;
  const totalProducts = productsData?.totalProducts || initialData.length;

  // Calculate pageCount based on server data for manual pagination
  const pageCount = Math.ceil(totalProducts / pagination.pageSize);

  const table = useReactTable({
    data: products,
    columns: productColumns,
    pageCount: pageCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Keep server-side pagination for performance with large datasets
    manualPagination: true,
    // Enable client-side sorting on the current page data
    manualSorting: false,
    // Enable client-side filtering on the current page data
    manualFiltering: false,
  });

  if (error) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load products</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading && !initialData.length) {
    return <ProductTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={productColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

/**
 * Skeleton component for loading state.
 */
function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-3">
            {/* Header row */}
            <div className="flex space-x-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
            {/* Data rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
