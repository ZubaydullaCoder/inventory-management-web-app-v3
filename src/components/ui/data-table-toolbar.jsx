"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { cn } from "@/lib/utils";

/**
 * Toolbar component for data tables with search and filter functionality.
 * @param {Object} props
 * @param {import("@tanstack/react-table").Table} props.table - The table instance
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Additional toolbar content
 * @param {React.ComponentType} [props.bulkActionsComponent] - Component to render when rows are selected
 */
export function DataTableToolbar({ table, className, children, bulkActionsComponent: BulkActionsComponent, ...props }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div
      className={cn("flex flex-col space-y-2", className)}
      {...props}
    >
      {selectedRowCount > 0 && BulkActionsComponent && (
        <BulkActionsComponent
          selectedProducts={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
          onClearSelection={() => table.resetRowSelection()}
          table={table}
        />
      )}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter products..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
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
    </div>
  );
}
