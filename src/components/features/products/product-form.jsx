"use client";

import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCreateSchema } from "@/lib/zod-schemas";
import { useCreateProduct } from "@/hooks/use-products";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Interactive form for creating new products with optimistic updates.
 * Provides client-side validation and auto-focus for efficient data entry.
 *
 * @param {{
 *   onOptimisticAdd: (optimisticProduct: object) => void,
 *   onSuccess: (confirmedProduct: object) => void,
 *   onError: (optimisticId: string) => void
 * }} props
 * @returns {JSX.Element} The product form component
 */
export default function ProductForm({ onOptimisticAdd, onSuccess, onError }) {
  const nameInputRef = useRef(null);
  const { mutate } = useCreateProduct();

  // Initialize form with validation schema
  const form = useForm({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      sellingPrice: 0,
      purchasePrice: 0,
      stock: 0,
      reorderPoint: 0,
      categoryId: "",
      supplierId: "",
    },
  });

  // Auto-focus name input on component mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  /**
   * Handle form submission with optimistic updates
   * @param {Object} values - Form values from react-hook-form
   */
  const onSubmit = (values) => {
    const optimisticId = `optimistic-${Date.now()}`;

    // Convert string values to numbers for price fields
    const processedValues = {
      ...values,
      sellingPrice: Number(values.sellingPrice),
      purchasePrice: Number(values.purchasePrice),
      stock: values.stock ? Number(values.stock) : undefined,
      reorderPoint: values.reorderPoint
        ? Number(values.reorderPoint)
        : undefined,
      categoryId: values.categoryId || undefined,
      supplierId: values.supplierId || undefined,
    };

    // --- FIX: Call onOptimisticAdd BEFORE mutate ---
    onOptimisticAdd({
      optimisticId,
      data: { ...processedValues, id: optimisticId },
      status: "pending",
    });
    // Instantly reset the form for the next entry
    form.reset();
    setTimeout(() => nameInputRef.current?.focus(), 100);

    // Now call mutate (no onMutate here!)
    mutate(processedValues, {
      onSuccess: (serverConfirmedProduct) => {
        onSuccess({ data: serverConfirmedProduct, optimisticId });
        toast.success("Product saved successfully!");
      },
      onError: (error) => {
        onError(optimisticId);
        toast.error(`Failed to save product: ${error.message}`);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Name - Required */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Product Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Phillips Screwdriver"
                  {...field}
                  ref={nameInputRef}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Selling Price *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Purchase Price *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Inventory Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Initial Stock
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorderPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Reorder Point
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Optional Relations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Category</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Category ID (optional)"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Supplier</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Supplier ID (optional)"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save and Add Another
          </Button>
        </div>
      </form>
    </Form>
  );
}
