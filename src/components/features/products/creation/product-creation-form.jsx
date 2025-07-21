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
  } = useProductCreationForm();

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

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
            Save and Add Another
          </Button>
        </div>
      </form>
    </Form>
  );
}
