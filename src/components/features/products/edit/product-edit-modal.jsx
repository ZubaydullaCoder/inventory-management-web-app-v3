"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "use-debounce";
import { productCreateSchema } from "@/lib/zod-schemas";
import { normalizeProductName } from "@/lib/utils";
import {
  useUpdateProduct,
  useCheckProductName,
} from "@/hooks/use-product-queries";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import ProductNameField from "../creation/product-name-field";
import NumberField from "../number-field";

/**
 * Modal component for editing an existing product.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.product - The product to edit
 * @param {Function} props.onSuccess - Callback function called when update succeeds
 * @returns {JSX.Element} The edit product modal component
 */
export default function ProductEditModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}) {
  const { mutate: updateProduct } = useUpdateProduct();

  // react-hook-form setup
  const form = useForm({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      sellingPrice: "",
      purchasePrice: "",
      stock: "",
      reorderPoint: "",
      categoryId: "",
      supplierId: "",
    },
  });

  const { control, handleSubmit, reset, watch, formState } = form;

  // normalize & debounce name for duplicate checking
  const rawName = watch("name");
  const normalized = normalizeProductName(rawName);
  const [debouncedName] = useDebounce(normalized, 500);

  // Compute original normalized name
  const originalNormalizedName = product
    ? normalizeProductName(product.name)
    : "";

  // --- NEW: Only check for duplicates if user actually edited the name field ---
  const nameDirty = !!formState.dirtyFields?.name;
  const nameHasChanged =
    nameDirty && debouncedName !== originalNormalizedName && !!debouncedName;

  const {
    data: nameCheckResult,
    isFetching: isCheckingName,
    error: nameCheckError,
  } = useCheckProductName(debouncedName, {
    enabled: nameHasChanged,
    excludeId: product?.id, // Pass current product id to exclude from duplicate check
  });

  const isNameDuplicate = Boolean(
    nameHasChanged && debouncedName && nameCheckResult?.exists
  );

  // --- Compute feedback flags for ProductNameField ---
  // Hide all validation feedback while submitting to prevent flicker on close
  const showChecking =
    nameHasChanged && isCheckingName && !formState.isSubmitting;
  const showDuplicate =
    nameHasChanged &&
    !isCheckingName &&
    isNameDuplicate &&
    !formState.isSubmitting;
  const showAvailable =
    nameHasChanged &&
    !isCheckingName &&
    !isNameDuplicate &&
    !nameCheckError &&
    !!rawName &&
    !formState.isSubmitting;
  const showError =
    nameHasChanged && !!nameCheckError && !formState.isSubmitting;

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (product && isOpen) {
      reset({
        name: product.name || "",
        sellingPrice: product.sellingPrice?.toString() || "",
        purchasePrice: product.purchasePrice?.toString() || "",
        stock: product.stock?.toString() || "",
        reorderPoint: product.reorderPoint?.toString() || "",
        categoryId: product.categoryId || "",
        supplierId: product.supplierId || "",
      });
    }
  }, [product, isOpen, reset]);

  // Compute if form values are meaningfully changed (deep compare)
  const isFormChanged = useMemo(() => {
    if (!product) return false;
    // Compare all fields after normalization and type conversion
    const fields = [
      "name",
      "sellingPrice",
      "purchasePrice",
      "stock",
      "reorderPoint",
      "categoryId",
      "supplierId",
    ];
    for (const field of fields) {
      let formValue = watch(field);
      let productValue = product[field];

      // Normalize and convert types for comparison
      if (field === "name") {
        formValue = normalizeProductName(formValue || "");
        productValue = normalizeProductName(productValue || "");
      } else if (
        ["sellingPrice", "purchasePrice", "stock", "reorderPoint"].includes(
          field
        )
      ) {
        formValue =
          formValue === "" || formValue == null ? undefined : Number(formValue);
        productValue =
          productValue === "" || productValue == null
            ? undefined
            : Number(productValue);
      } else {
        formValue = formValue || undefined;
        productValue = productValue || undefined;
      }
      if (formValue !== productValue) return true;
    }
    return false;
  }, [
    product,
    watch("name"),
    watch("sellingPrice"),
    watch("purchasePrice"),
    watch("stock"),
    watch("reorderPoint"),
    watch("categoryId"),
    watch("supplierId"),
  ]);

  const onSubmit = (values) => {
    if (isNameDuplicate) {
      toast.error("Please choose a different product name.");
      return;
    }

    const processed = {
      ...values,
      name: normalized,
      sellingPrice: Number(values.sellingPrice),
      purchasePrice: Number(values.purchasePrice),
      stock: values.stock ? Number(values.stock) : undefined,
      reorderPoint: values.reorderPoint
        ? Number(values.reorderPoint)
        : undefined,
      categoryId: values.categoryId || undefined,
      supplierId: values.supplierId || undefined,
    };

    // --- NEW: Optimistically update parent and close modal immediately ---
    onSuccess?.({ ...product, ...processed });
    onClose();

    updateProduct(
      { productId: product.id, productData: processed },
      {
        onSuccess: (updatedProduct) => {
          toast.success("Product updated successfully!");
        },
        onError: (err) => {
          const msg = err.message.includes("already exists")
            ? "Product name already exists. Please choose a different name."
            : `Failed to update product: ${err.message}`;
          toast.error(msg);
        },
      }
    );
  };

  // Disable submit if:
  // - No meaningful change
  // - Name duplicate
  // - Name is being checked
  // - Form is submitting
  const isSubmitDisabled =
    !isFormChanged ||
    isNameDuplicate ||
    isCheckingName ||
    formState.isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                label="Current Stock"
                placeholder="0"
              />
              <NumberField
                control={control}
                name="reorderPoint"
                label="Reorder Point"
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitDisabled}
              >
                {formState.isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Update Product
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
