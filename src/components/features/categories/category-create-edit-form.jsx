"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Check, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
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
 * Inline form component for creating or editing categories
 * @param {Object} props
 * @param {Object} [props.category] - Category to edit (null for create mode)
 * @param {function} [props.onSuccess] - Callback after successful operation
 * @param {function} [props.onCancel] - Callback when operation is cancelled
 * @param {boolean} [props.isEditing] - Whether in edit mode
 */
export default function CategoryCreateEditForm({
  category = null,
  onSuccess,
  onCancel,
  isEditing = false,
}) {
  const [isCreateMode, setIsCreateMode] = useState(!category && !isEditing);
  const inputRef = useRef(null);

  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();

  const form = useForm({
    resolver: zodResolver(categoryCreateSchema),
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

  // Auto-focus input when entering create/edit mode
  useEffect(() => {
    if (isCreateMode || isEditing) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isCreateMode, isEditing]);

  const handleCreate = () => {
    setIsCreateMode(true);
    reset({ name: "" });
  };

  const handleCancelCreate = () => {
    setIsCreateMode(false);
    reset({ name: "" });
    onCancel?.();
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
      // Edit mode
      updateCategory(
        { categoryId: category.id, categoryData: processedData },
        {
          onSuccess: (updatedCategory) => {
            toast.success("Category updated successfully!");
            onSuccess?.(updatedCategory);
          },
          onError: (error) => {
            const errorMessage = error.message.includes("already exists")
              ? "Category name already exists. Please choose a different name."
              : `Failed to update category: ${error.message}`;
            toast.error(errorMessage);
          },
        }
      );
    } else {
      // Create mode
      createCategory(processedData, {
        onSuccess: (newCategory) => {
          toast.success("Category created successfully!");
          reset({ name: "" });
          setIsCreateMode(false);
          onSuccess?.(newCategory);
        },
        onError: (error) => {
          const errorMessage = error.message.includes("already exists")
            ? "Category name already exists. Please choose a different name."
            : `Failed to create category: ${error.message}`;
          toast.error(errorMessage);
        },
      });
    }
  };

  const isSubmitDisabled =
    isNameDuplicate || isCheckingName || formState.isSubmitting;

  if (!isCreateMode && !isEditing) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCreate}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New Category
      </Button>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Category name"
                    {...field}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={isSubmitDisabled}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelCreate}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
              {/* Show real-time feedback */}
              {nameHasChanged && (
                <div className="text-xs">
                  {isCheckingName && (
                    <span className="text-muted-foreground">Checking...</span>
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
      </form>
    </Form>
  );
}
