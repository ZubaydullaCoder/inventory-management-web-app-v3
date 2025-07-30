"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { cn } from "@/lib/utils";
import { ProductCategoryFilter } from "@/components/features/products/display/product-category-filter";
import { ProductUnitFilter } from "@/components/features/products/display/product-unit-filter";

/**
 * Toolbar component for data tables with search and filter functionality.
 * @param {Object} props
 * @param {import("@tanstack/react-table").Table} props.table - The table instance
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Additional toolbar content
 * @param {React.ComponentType} [props.bulkActionsComponent] - Component to render when rows are selected (deprecated - now handled at bottom)
 */
export function DataTableToolbar({ table, className, children, bulkActionsComponent: BulkActionsComponent, ...props }) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter products..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("category") && (
          <ProductCategoryFilter
            column={table.getColumn("category")}
            title="Category"
          />
        )}
        {table.getColumn("unit") && (
          <ProductUnitFilter
            column={table.getColumn("unit")}
            title="Unit"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
