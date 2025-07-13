// src/components/features/products/category-creatable-select.jsx

"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Controller } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { normalizeCategoryName } from "@/lib/utils";
import {
  useGetCategories,
  useCreateCategory,
} from "@/hooks/use-category-queries";
import { toast } from "sonner";

/**
 * CreatableSelect component for category selection with the ability to create new categories.
 *
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.name - Field name for the form
 * @param {string} [props.label] - Label for the field
 * @param {boolean} [props.required] - Whether the field is required
 * @param {string} [props.placeholder] - Placeholder text
 * @returns {JSX.Element}
 */
export default function CategoryCreatableSelect({
  control,
  name = "categoryId",
  label = "Category",
  required = false,
  placeholder = "Category (optional)",
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } =
    useGetCategories();
  const { mutate: createCategory } = useCreateCategory();

  // Filter categories based on search input
  const normalizedSearch = normalizeCategoryName(searchValue);
  const filteredCategories = categories.filter((category) =>
    normalizeCategoryName(category.name).includes(normalizedSearch)
  );

  // Check if there's an exact match
  const exactMatch = filteredCategories.find(
    (category) => normalizeCategoryName(category.name) === normalizedSearch
  );

  // Show create option only if there's search text and no exact match
  const showCreateOption =
    searchValue.trim() && !exactMatch && normalizedSearch;

  const handleCreateCategory = (field) => {
    if (!searchValue.trim()) return;

    createCategory(
      { name: searchValue.trim() },
      {
        onSuccess: (newCategory) => {
          // Set the newly created category as selected
          field.onChange(newCategory.id);
          setOpen(false);
          setSearchValue("");
          toast.success(`Category "${newCategory.name}" created successfully!`);
        },
        onError: (error) => {
          const errorMessage = error.message.includes("already exists")
            ? "Category name already exists. Please choose a different name."
            : `Failed to create category: ${error.message}`;
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleSelectCategory = (field, categoryId) => {
    field.onChange(categoryId);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Find the selected category for display
        const selectedCategory = categories.find(
          (category) => category.id === field.value
        );

        return (
          <FormItem className="flex flex-col">
            <FormLabel className={cn(required && "required")}>
              {label}
            </FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {selectedCategory ? selectedCategory.name : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search categories..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    {/* Create new category option */}
                    {showCreateOption && (
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => handleCreateCategory(field)}
                          className="cursor-pointer"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          <span className="font-medium">
                            Create "{searchValue.trim()}"
                          </span>
                        </CommandItem>
                      </CommandGroup>
                    )}

                    {/* Existing categories */}
                    {categoriesLoading ? (
                      <CommandEmpty>Loading categories...</CommandEmpty>
                    ) : filteredCategories.length === 0 && !showCreateOption ? (
                      <CommandEmpty>
                        {categories.length === 0
                          ? "No categories yet. Start typing to create one."
                          : "No categories found."}
                      </CommandEmpty>
                    ) : (
                      filteredCategories.length > 0 && (
                        <CommandGroup>
                          {filteredCategories.map((category) => (
                            <CommandItem
                              key={category.id}
                              onSelect={() =>
                                handleSelectCategory(field, category.id)
                              }
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === category.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
