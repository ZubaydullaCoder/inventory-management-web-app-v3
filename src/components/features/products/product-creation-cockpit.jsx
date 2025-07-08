// src/components/features/products/product-creation-cockpit.jsx
"use client";

import { useState } from "react";
import ProductForm from "@/components/features/products/product-form";
import SessionCreationList from "@/components/features/products/session-creation-list";

/**
 * Client-side wrapper for the product creation cockpit.
 * Manages the local state for products created within this session
 * to provide a fully optimistic UI.
 *
 * @returns {JSX.Element} The interactive two-column cockpit layout.
 */
export default function ProductCreationCockpit() {
  // State is now held locally in this client component.
  const [sessionProducts, setSessionProducts] = useState([]);

  /**
   * Callback for optimistic updates. Adds a new product to the local state.
   * @param {{optimisticId: string, data: object, status: string}} optimisticProduct
   */
  const handleOptimisticAdd = (optimisticProduct) => {
    setSessionProducts((prev) => [optimisticProduct, ...prev]);
  };

  /**
   * Callback for successful server response. Updates the product with confirmed data.
   * @param {{data: object, optimisticId: string}} confirmedProduct
   */
  const handleSuccess = (confirmedProduct) => {
    setSessionProducts((prev) =>
      prev.map((p) =>
        p.optimisticId === confirmedProduct.optimisticId
          ? { ...p, data: confirmedProduct.data, status: "success" }
          : p
      )
    );
  };

  /**
   * Callback for failed server response. Marks the product as 'error'.
   * @param {string} optimisticId
   */
  const handleError = (optimisticId) => {
    setSessionProducts((prev) =>
      prev.map((p) =>
        p.optimisticId === optimisticId ? { ...p, status: "error" } : p
      )
    );
    // Auto-remove failed items after a delay for better UX.
    setTimeout(() => {
      setSessionProducts((prev) =>
        prev.filter((p) => p.optimisticId !== optimisticId)
      );
    }, 5000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
      {/* Left Column: Product Form */}
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Product Details
          </h2>
          <ProductForm
            onOptimisticAdd={handleOptimisticAdd}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </div>

      {/* Right Column: Session Creation List */}
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-6 h-full">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Recently Added
          </h2>
          <SessionCreationList products={sessionProducts} />
        </div>
      </div>
    </div>
  );
}
