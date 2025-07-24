// Test page for Phase 1 Category Management Card implementation
"use client";

import { useState } from "react";
import { CategoryManagementCard } from "@/components/features/categories";

/**
 * Test page to demonstrate Phase 1 CategoryManagementCard functionality
 * This is temporary and will be removed after integration
 */
export default function CategoryTestPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    console.log("Selected category ID:", categoryId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-foreground">
          Category Management Test - Phase 1
        </h1>
        <p className="text-muted-foreground mt-2">
          Testing the new CategoryManagementCard component with full CRUD functionality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Management Card */}
        <div className="space-y-4">
          <CategoryManagementCard
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
            title="Phase 1: Basic Categories"
            showCreateForm={true}
          />
          
          {/* Phase 2: Paginated Categories */}
          <CategoryManagementCard
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
            title="Phase 2: Paginated Categories"
            showCreateForm={false}
            usePagination={true}
            pageSize={5}
          />
        </div>

        {/* Debug Info */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Debug Information
            </h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Selected Category ID:</span>{" "}
                {selectedCategoryId || "None"}
              </p>
              <p className="text-sm text-muted-foreground">
                This card demonstrates all Phase 1 features:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• Create new categories with duplicate checking</li>
                <li>• Search and filter categories in real-time</li>
                <li>• Edit categories inline</li>
                <li>• Delete categories with confirmation</li>
                <li>• Select categories (integration ready)</li>
                <li>• Responsive card-based design using shadcn</li>
              </ul>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Next Steps
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Phase 1: Component structure complete</li>
              <li>• Phase 2: Implement cursor-based pagination</li>
              <li>• Phase 3: Integration with product forms</li>
              <li>• Phase 4: Enhanced CRUD operations</li>
              <li>• Phase 5: UI/UX improvements</li>
              <li>• Phase 6: Testing & optimization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
