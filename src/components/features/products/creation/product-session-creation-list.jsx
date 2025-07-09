"use client";

import { Package } from "lucide-react";
import ProductSessionCreationItem from "./product-session-creation-item";

/**
 * Displays a list of products passed via props, with status indicators.
 * This is a pure presentational component.
 *
 * @param {{ products: Array<{data: object, status: string, optimisticId: string}> }} props
 * @returns {JSX.Element}
 */
export default function ProductSessionCreationList({ products = [] }) {
  /**
   * Handles the edit action for a product.
   * @param {object} product
   */
  const handleEditProduct = (product) => {
    // Replace with actual edit logic/modal trigger
    console.log("Edit product:", product);
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg font-medium">
          No products added yet
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Newly added products will appear here instantly
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {products.map(({ data: product, status, optimisticId }) => (
        <ProductSessionCreationItem
          key={optimisticId}
          product={product}
          status={status}
          onEdit={handleEditProduct}
        />
      ))}

      {/* List Summary */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          {products.length} product{products.length !== 1 ? "s" : ""} in this
          session
        </p>
      </div>
    </div>
  );
}
