"use client";

import { useCallback } from "react";
import ProductNameField from "./creation/product-name-field";
import NumberField from "./number-field";
import UnitSelectField from "./unit-select-field";
import { CategorySection } from "@/components/features/categories";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { HiddenField } from "@/components/ui/hidden-field";
import { Input } from "@/components/ui/input";
import FormSectionCard from "@/components/ui/form-section-card";

export default function ProductFormFields({
  form,
  control,
  nameInputRef,
  isCheckingName,
  isNameDuplicate,
  nameCheckError,
  showAvailable,
  isEdit = false,
}) {
  const selectedCategoryId = form.watch("categoryId");

  const handleCategorySelect = useCallback(
    (categoryId) => {
      form.setValue("categoryId", categoryId, {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: false,
      });
    },
    [form]
  );

  return (
    <div className="space-y-6">
      <HiddenField control={control} name="categoryId" />

      <FormSectionCard
        title="Product Details"
        description={`${
          isEdit ? "Update" : "Basic"
        } product information and pricing`}
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
            label={isEdit ? "Current Stock" : "Initial Stock"}
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

      <FormSectionCard
        title="Category"
        description={`${
          isEdit ? "Update" : "Select or create a"
        } product category`}
      >
        <CategorySection
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
          showTitle={false}
        />
      </FormSectionCard>

      <FormSectionCard
        title="Supplier"
        description={`Optional${isEdit ? " update" : ""} supplier information`}
      >
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
    </div>
  );
}
