"use client";

import ProductNameField from "./product-name-field";
import NumberField from "../number-field";
import UnitSelectField from "../unit-select-field";
import CategoryCreatableSelect from "../category-creatable-select";
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
import { useProductCreationForm } from "@/hooks/use-product-creation-form";

/**
 * Renders product form UI only. All logic lives in `useProductForm`.
 */
export default function ProductCreationForm({
  onOptimisticAdd,
  onSuccess,
  onError,
}) {
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
  } = useProductCreationForm({ onOptimisticAdd, onSuccess, onError });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            placeholder="0.00"
            step="0.01"
            required
          />
          <NumberField
            control={control}
            name="purchasePrice"
            label="Purchase Price"
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField
            control={control}
            name="stock"
            label="Initial Stock"
            placeholder="0"
          />
          <UnitSelectField
            control={control}
            name="unit"
            label="Unit of Measure"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField
            control={control}
            name="reorderPoint"
            label="Reorder Point"
            placeholder="0"
          />
          <div /> {/* Empty space for layout balance */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryCreatableSelect
            control={control}
            name="categoryId"
            label="Category"
          />
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
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
            Save and Add Another
          </Button>
        </div>
      </form>
    </Form>
  );
}
