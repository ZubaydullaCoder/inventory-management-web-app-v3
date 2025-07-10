import { useEffect, useMemo, useCallback } from "react";
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

/**
 * Encapsulates all form state and submission logic for Product Edit Modal.
 * @param {{
 *   product: object,
 *   isOpen: boolean,
 *   onSuccess: Function,
 *   onClose: Function
 * }} props
 */
export function useProductEditForm({ product, isOpen, onSuccess, onClose }) {
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

  // Only check for duplicates if user actually edited the name field
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

  // Compute feedback flags for ProductNameField
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

  const onSubmit = useCallback(
    (values) => {
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

      // Optimistically update parent and close modal immediately
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
    },
    [isNameDuplicate, normalized, product, onSuccess, onClose, updateProduct]
  );

  // Disable submit if no meaningful change, name duplicate, checking, or submitting
  const isSubmitDisabled =
    !isFormChanged ||
    isNameDuplicate ||
    isCheckingName ||
    formState.isSubmitting;

  return {
    form,
    control,
    handleSubmit,
    onSubmit,
    showChecking,
    showDuplicate,
    showAvailable,
    showError,
    isSubmitDisabled,
    formState,
  };
}
