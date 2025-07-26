"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Check, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { categoryCreateSchema } from "@/lib/zod-schemas";
import {
  useCreateCategory,
  useUpdateCategory,
  useCheckCategoryName,
} from "@/hooks/use-category-queries";
import { normalizeCategoryName } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

/**
 * Modal-based form component for creating or editing categories
 * This avoids nested form issues when used inside product forms
 * @param {Object} props
 * @param {Object} [props.category] - Category to edit (null for create mode)
 * @param {function} [props.onSuccess] - Callback after successful operation
 * @param {function} [props.onCancel] - Callback when operation is cancelled
 * @param {boolean} [props.isEditing] - Whether in edit mode
 * @param {React.ReactNode} [props.trigger] - Custom trigger element
 */
export default function CategoryCreateEditModal({
  category = null,
  onSuccess,
  onCancel,
  isEditing = false,
  trigger,
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();

  const form = useForm({
    resolver: zodResolver(categoryCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: category?.name || "",
    },
  });

  const { control, handleSubmit, reset, watch, formState } = form;

  // Watch name field for duplicate checking
  const rawName = watch("name");
  const normalizedName = normalizeCategoryName(rawName);
  const [debouncedName] = useDebounce(normalizedName, 500);

  // Check for duplicate names (excluding current category if editing)
  const nameDirty = !!formState.dirtyFields?.name;
  const nameHasChanged = nameDirty && !!debouncedName;

  const {
    data: nameCheckResult,
    isFetching: isCheckingName,
    error: nameCheckError,
  } = useCheckCategoryName(debouncedName, {
    enabled: nameHasChanged,
    excludeId: category?.id,
    staleTime: category?.id ? Infinity : 0,
  });

  const isNameDuplicate = Boolean(nameHasChanged && nameCheckResult?.exists);

  // Check if form has meaningful changes (for edit mode)
  const isFormChanged = useMemo(() => {
    if (!category) {
      // Create mode: check if input is not empty after normalization
      return Boolean(normalizedName.trim());
    }

    // Edit mode: check if there are meaningful changes
    const originalNormalizedName = normalizeCategoryName(category.name || "");
    return normalizedName !== originalNormalizedName;
  }, [category, normalizedName]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Reset form when category changes or modal opens
  useEffect(() => {
    if (open) {
      reset({ name: category?.name || "" });
    }
  }, [open, category, reset]);

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset({ name: "" });
      onCancel?.();
    }
  };

  const onSubmit = (values) => {
    if (isNameDuplicate) {
      toast.error(
        "Category name already exists. Please choose a different name."
      );
      return;
    }

    const processedData = {
      ...values,
      name: normalizedName,
    };

    if (category) {
      // Edit mode - close modal immediately for optimistic update
      setOpen(false);
      onSuccess?.({
        ...category,
        ...processedData,
      });

      updateCategory(
        { categoryId: category.id, categoryData: processedData },
        {
          onSuccess: (updatedCategory) => {
            toast.success("Category updated successfully!");
            // Modal already closed, just call onSuccess for any additional handling
            onSuccess?.(updatedCategory);
          },
          onError: (error) => {
            const errorMessage = error.message.includes("already exists")
              ? "Category name already exists. Please choose a different name."
              : `Failed to update category: ${error.message}`;
            toast.error(errorMessage);
            // Note: Modal is already closed, but optimistic update will be reverted by TanStack Query
          },
        }
      );
    } else {
      // Create mode - close modal immediately for optimistic update
      setOpen(false);
      reset({ name: "" });

      // Create optimistic category data for immediate selection (same pattern as product creation)
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticCategory = {
        id: optimisticId,
        name: normalizedName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Immediately call onSuccess with optimistic data for instant feedback
      onSuccess?.(optimisticCategory);

      createCategory(processedData, {
        onSuccess: (newCategory) => {
          toast.success("Category created successfully!");
          // Update selection with real category data
          onSuccess?.(newCategory);
        },
        onError: (error) => {
          const errorMessage = error.message.includes("already exists")
            ? "Category name already exists. Please choose a different name."
            : `Failed to create category: ${error.message}`;
          toast.error(errorMessage);
          // Note: Modal is already closed, but optimistic update will be reverted by TanStack Query
        },
      });
    }
  };

  // Disable submit if:
  // - No meaningful changes (empty for create, no changes for edit)
  // - Name is duplicate
  // - Currently checking name
  // - Form is submitting
  const isSubmitDisabled =
    !isFormChanged ||
    isNameDuplicate ||
    isCheckingName ||
    formState.isSubmitting;

  // Default trigger for create mode
  const defaultCreateTrigger = (
    <Button type="button" variant="outline" size="sm" className="w-full">
      <Plus className="w-4 h-4 mr-2" />
      Add New Category
    </Button>
  );

  // Default trigger for edit mode
  const defaultEditTrigger = (
    <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0">
      <Edit className="w-3 h-3" />
    </Button>
  );

  const triggerElement =
    trigger || (category ? defaultEditTrigger : defaultCreateTrigger);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent 
        className="sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation(); // Prevent submit event from bubbling to parent form
              handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      ref={inputRef}
                      placeholder="Enter category name"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        // Prevent Enter key from bubbling up to parent form
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Show real-time feedback */}
                  {nameHasChanged && (
                    <div className="text-xs">
                      {isCheckingName && (
                        <span className="text-muted-foreground">
                          Checking...
                        </span>
                      )}
                      {!isCheckingName && isNameDuplicate && (
                        <span className="text-destructive">
                          Name already exists
                        </span>
                      )}
                      {!isCheckingName &&
                        !isNameDuplicate &&
                        !nameCheckError &&
                        rawName && (
                          <span className="text-green-600">Available</span>
                        )}
                      {nameCheckError && (
                        <span className="text-destructive">
                          Error checking name
                        </span>
                      )}
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
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
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-b-transparent" />
                )}
                {category ? "Update" : "Create"} Category
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
