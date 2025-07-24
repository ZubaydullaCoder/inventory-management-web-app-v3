"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  EyeOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Sortable column header component for data tables.
 * @param {Object} props
 * @param {import("@tanstack/react-table").Column} props.column - The table column instance
 * @param {string} props.title - The column header title
 * @param {string} [props.className] - Additional CSS classes
 */
export function DataTableColumnHeader({ column, title, className, ...props }) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("-ml-3 h-8 data-[state=open]:bg-accent", className)}
          {...props}
        >
          <span>{title}</span>
          {column.getCanSort() &&
            (column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            ))}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[160px]">
        {column.getCanSort() && (
          <>
            <DropdownMenuCheckboxItem
              checked={column.getIsSorted() === "asc"}
              onCheckedChange={() => column.toggleSorting(false)}
            >
              <ChevronUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Asc
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={column.getIsSorted() === "desc"}
              onCheckedChange={() => column.toggleSorting(true)}
            >
              <ChevronDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Desc
            </DropdownMenuCheckboxItem>
{column.getIsSorted() && (
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                <X className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Clear sort
              </DropdownMenuItem>
            )}
          </>
        )}
        {column.getCanHide() && (
          <DropdownMenuCheckboxItem
            checked={!column.getIsVisible()}
            onCheckedChange={() => column.toggleVisibility(false)}
          >
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
