"use client";

import { useState } from "react";
import ProductForm from "@/components/features/products/product-form";
import SessionCreationList from "@/components/features/products/session-creation-list";

/**
 * Cockpit page for bulk-adding products. Manages the local state
 * for products created within this session for an optimistic UI.
 *
 * @returns {JSX.Element} The cockpit page component
 */
export default function ProductCockpitPage() {
  const [sessionProducts, setSessionProducts] = useState([]);
  console.log("sessionProducts in cockpit page", sessionProducts)
  /**
   * Callback function for optimistic updates.
   * Adds a new product to the local state with 'pending' status.
   * @param {{optimisticId: string, data: object, status: string}} optimisticProduct
   */
  const handleOptimisticAdd = (optimisticProduct) => {
    setSessionProducts((prev) => [optimisticProduct, ...prev]);
  };

  /**
   * Callback function for successful product creation.
   * Updates the optimistic product with confirmed server data.
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
   * Callback function for failed product creation.
   * Updates the optimistic product status to 'error' and removes it after delay.
   * @param {string} optimisticId
   */
  const handleError = (optimisticId) => {
    setSessionProducts((prev) =>
      prev.map((p) =>
        p.optimisticId === optimisticId ? { ...p, status: "error" } : p
      )
    );
    // Auto-remove failed items after a delay
    setTimeout(() => {
      setSessionProducts((prev) =>
        prev.filter((p) => p.optimisticId !== optimisticId)
      );
    }, 5000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-foreground">Add New Products</h1>
        <p className="text-muted-foreground mt-2">
          Efficiently bulk-add products to your inventory. Changes appear
          instantly on the right.
        </p>
      </div>

      {/* Two-Column Cockpit Layout */}
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
    </div>
  );
}
