"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

/**
 * Presentational name field showing spinner, duplicate/error messages.
 */
export default function ProductNameField({
  control,
  nameInputRef,
  isCheckingName,
  isNameDuplicate,
  nameCheckError,
}) {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Product Name *</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                placeholder="e.g., Phillips Screwdriver"
                {...field}
                ref={nameInputRef}
              />
              {isCheckingName && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
          {isCheckingName && (
            <p className="text-xs text-muted-foreground">Checking name...</p>
          )}
          {!isCheckingName && isNameDuplicate && (
            <p className="text-xs text-red-600">
              A product with this name already exists.
            </p>
          )}
          {!isCheckingName &&
            !isNameDuplicate &&
            !nameCheckError &&
            field.value && (
              <p className="text-xs text-green-600">✓ Name is available</p>
            )}
          {nameCheckError && (
            <p className="text-xs text-yellow-600">
              Unable to verify name uniqueness right now.
            </p>
          )}
        </FormItem>
      )}
    />
  );
}
