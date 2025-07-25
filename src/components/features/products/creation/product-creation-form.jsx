"use client";

import { useCallback } from "react";
import ProductNameField from "./product-name-field";
import NumberField from "../number-field";
import UnitSelectField from "../unit-select-field";
import { CategorySection } from "@/components/features/categories";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { HiddenField } from "@/components/ui/hidden-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormSectionCard from "@/components/ui/form-section-card";
import { useProductCreationForm } from "@/hooks/use-product-creation-form";

/**
 * Renders product form UI only. All logic lives in `useProductForm`.
 */
export default function ProductCreationForm() {
  const {
    form,
    control,
    handleSubmit,
    onSubmit,
    nameInputRef,
    isCheckingName,
    isNameDuplicate,
    nameCheckError,
    showAvailable,
    isSubmitDisabled,
    watch,
  } = useProductCreationForm();

  // Watch the categoryId to display selected category
  const selectedCategoryId = watch("categoryId");

  // Handle category selection from the CategoryManagementCard
  const handleCategorySelect = useCallback((categoryId) => {
    form.setValue("categoryId", categoryId, {
      shouldValidate: false, // Don't trigger validation
      shouldDirty: true, // Mark as dirty for unsaved changes detection
      shouldTouch: false, // Don't mark as touched to avoid validation triggers
    });
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden categoryId field for form integration */}
        <HiddenField control={control} name="categoryId" />
        
        {/* Product Details Section */}
        <FormSectionCard 
          title="Product Details" 
          description="Basic product information and pricing"
        >
          <ProductNameField
            control={control}
            nameInputRef={nameInputRef}
            isCheckingName={isCheckingName}
            isNameDuplicate={isNameDuplicate}
            nameCheckError={nameCheckError}
            showAvailable={showAvailable}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberField
              control={control}
              name="sellingPrice"
              label="Selling Price"
              placeholder="0"
              required
              decimalScale={0}
              suffix=" so'm"
            />
            <NumberField
              control={control}
              name="purchasePrice"
              label="Purchase Price"
              placeholder="0"
              required
              decimalScale={0}
              suffix=" so'm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberField
              control={control}
              name="stock"
              label="Initial Stock"
              placeholder="0"
              decimalScale={0}
            />
            <NumberField
              control={control}
              name="reorderPoint"
              label="Reorder Point"
              placeholder="0"
              decimalScale={0}
            />
          </div>

          <UnitSelectField
            control={control}
            name="unit"
            label="Unit of Measure"
          />
        </FormSectionCard>

        {/* Category Section */}
        <FormSectionCard title="Category" description="Select or create a product category">
          <CategorySection
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
            showTitle={false}
          />
        </FormSectionCard>

        {/* Supplier Section */}
        <FormSectionCard title="Supplier" description="Optional supplier information">
          <FormField
            control={control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSectionCard>

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
            Save and Add Another
          </Button>
        </div>
      </form>
    </Form>
  );
}
