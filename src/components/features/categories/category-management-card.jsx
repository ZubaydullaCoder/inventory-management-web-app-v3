"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CategorySearchFilter from "./category-search-filter";
import CategoryCreateEditModal from "./category-create-edit-modal";
import CategoryList from "./category-list";

/**
 * Main category management card component that orchestrates all category functionality
 * @param {Object} props
 * @param {string} [props.selectedCategoryId] - Currently selected category ID
 * @param {function} [props.onCategorySelect] - Callback when category is selected
 * @param {string} [props.title] - Card title
 * @param {boolean} [props.showCreateForm] - Whether to show the create form
 */
export default function CategoryManagementCard({
  selectedCategoryId,
  onCategorySelect,
  title = "Categories",
  showCreateForm = true,
  usePagination = false, // Default to false for backward compatibility
  pageSize = 10,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleCategoryCreated = (newCategory) => {
    // Automatically select the newly created category
    if (onCategorySelect) {
      onCategorySelect(newCategory.id);
    }
    // Clear search to show the new category
    setSearchQuery("");
  };

  const handleCategorySelect = (categoryId) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Category Modal */}
        {showCreateForm && (
          <CategoryCreateEditModal onSuccess={handleCategoryCreated} />
        )}

        {/* Search Filter */}
        <CategorySearchFilter
          onSearchChange={handleSearchChange}
          value={searchQuery}
        />

        {/* Category List */}
        <CategoryList
          searchQuery={searchQuery}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
          usePagination={usePagination}
          pageSize={pageSize}
        />
      </CardContent>
    </Card>
  );
}
