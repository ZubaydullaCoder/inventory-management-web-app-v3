"use client";

import * as React from "react";
import { CalendarIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function parseAsDate(timestamp) {
  if (!timestamp) return undefined;
  const numericTimestamp = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  const date = new Date(numericTimestamp);
  return !Number.isNaN(date.getTime()) ? date : undefined;
}

function parseColumnFilterValue(value) {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "number" || typeof item === "string") {
        return item;
      }
      return undefined;
    });
  }

  if (typeof value === "string" || typeof value === "number") {
    return [value];
  }

  return [];
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Date range filter component for product table.
 * @param {Object} props
 * @param {import("@tanstack/react-table").Column} props.column - The table column for date filtering
 * @param {string} props.title - The filter title
 */
export function ProductDateFilter({ column, title }) {
  const columnFilterValue = column.getFilterValue();

  const selectedDates = React.useMemo(() => {
    if (!columnFilterValue) {
      return { from: undefined, to: undefined };
    }

    const timestamps = parseColumnFilterValue(columnFilterValue);
    return {
      from: parseAsDate(timestamps[0]),
      to: parseAsDate(timestamps[1]),
    };
  }, [columnFilterValue]);

  const onSelect = React.useCallback(
    (date) => {
      console.log('ProductDateFilter onSelect:', { date });
      if (!date) {
        column.setFilterValue(undefined);
        return;
      }

      const from = date.from?.getTime();
      const to = date.to?.getTime();
      console.log('ProductDateFilter timestamps:', { from, to });
      column.setFilterValue(from || to ? [from, to] : undefined);
    },
    [column],
  );

  const onReset = React.useCallback(
    (event) => {
      event.stopPropagation();
      column.setFilterValue(undefined);
    },
    [column],
  );

  const hasValue = React.useMemo(() => {
    return selectedDates.from || selectedDates.to;
  }, [selectedDates]);

  const formatDateRange = React.useCallback((range) => {
    if (!range.from && !range.to) return "";
    if (range.from && range.to) {
      return `${formatDate(range.from)} - ${formatDate(range.to)}`;
    }
    return formatDate(range.from ?? range.to);
  }, []);

  const label = React.useMemo(() => {
    const hasSelectedDates = selectedDates.from || selectedDates.to;
    const dateText = hasSelectedDates
      ? formatDateRange(selectedDates)
      : "Select date range";

    return (
      <span className="flex items-center gap-2">
        <span>{title}</span>
        {hasSelectedDates && (
          <>
            <Separator
              orientation="vertical"
              className="mx-0.5 data-[orientation=vertical]:h-4"
            />
            <span>{dateText}</span>
          </>
        )}
      </span>
    );
  }, [selectedDates, formatDateRange, title]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          {hasValue ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              onClick={onReset}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <XCircle className="h-4 w-4" />
            </div>
          ) : (
            <CalendarIcon className="h-4 w-4" />
          )}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          captionLayout="dropdown"
          mode="range"
          selected={selectedDates}
          onSelect={onSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
