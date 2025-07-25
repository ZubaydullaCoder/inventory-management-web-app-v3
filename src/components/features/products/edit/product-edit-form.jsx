"use client";

import { useCallback } from "react";
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
import { Loader2 } from "lucide-react";
import ProductNameField from "../creation/product-name-field";
import NumberField from "../number-field";
import UnitSelectField from "../unit-select-field";
import { CategorySection } from "@/components/features/categories";

export default function ProductEditForm({
  form,
  control,
  handleSubmit,
  onSubmit,
  onClose,
  showChecking,
  showDuplicate,
  showAvailable,
  showError,
  isSubmitDisabled,
  formState,
}) {
  // Watch the categoryId to display selected category
  const selectedCategoryId = form.watch("categoryId");

  // Handle category selection from CategorySection
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
          description="Update product information and pricing"
        >
          <ProductNameField
            control={control}
            nameInputRef={null}
            isCheckingName={showChecking}
            isNameDuplicate={showDuplicate}
            nameCheckError={showError}
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
              label="Current Stock"
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
        <FormSectionCard title="Category" description="Update product category">
          <CategorySection
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
            showTitle={false}
          />
        </FormSectionCard>

        {/* Supplier Section */}
        <FormSectionCard title="Supplier" description="Update supplier information">
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

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitDisabled}>
            {formState.isSubmitting && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Update Product
          </Button>
        </div>
      </form>
    </Form>
  );
}
