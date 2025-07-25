"use client";

import { useState } from "react";
import CategorySearchFilter from "./category-search-filter";
import CategoryCreateEditModal from "./category-create-edit-modal";
import CategoryList from "./category-list";

/**
 * Category section component without card wrapper for use within forms
 * This provides the same functionality as CategoryManagementCard but without the card styling
 * @param {Object} props
 * @param {string} [props.selectedCategoryId] - Currently selected category ID
 * @param {function} [props.onCategorySelect] - Callback when category is selected
 * @param {string} [props.title] - Section title
 * @param {boolean} [props.showCreateForm] - Whether to show the create form
 * @param {boolean} [props.showTitle] - Whether to show the title
 * @param {boolean} [props.usePagination=true] - Whether to use pagination (recommended for scalability)
 * @param {number} [props.pageSize=5] - Number of categories per page when pagination is enabled
 */
export default function CategorySection({
  selectedCategoryId,
  onCategorySelect,
  title = "Categories",
  showCreateForm = true,
  showTitle = true,
  usePagination = true,
  pageSize = 5,
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
    <div className="space-y-4">
      {/* Section Title */}
      {showTitle && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}

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
    </div>
  );
}
