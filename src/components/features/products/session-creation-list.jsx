"use client";

import { Pencil, Package, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Displays a list of products passed via props, with status indicators.
 * This is a pure presentational component.
 *
 * @param {{ products: Array<{data: object, status: string, optimisticId: string}> }} props
 * @returns {JSX.Element}
 */
export default function SessionCreationList({ products = [] }) {
  console.log("products in session creation list", products);
  const handleEditProduct = (product) => {
    console.log("Edit product:", product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price || 0);
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
        <div
          key={optimisticId}
          className={`border border-border rounded-lg p-4 transition-all duration-200 ${
            status === "pending"
              ? "opacity-70 bg-muted/30 border-dashed"
              : status === "error"
              ? "bg-red-50 border-red-200"
              : "bg-background hover:bg-muted/20"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-grow space-y-2">
              {/* Product Name */}
              <h3 className="font-medium text-foreground line-clamp-2">
                {product.name}
              </h3>

              {/* Price Information */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <span className="font-medium">Sell:</span>{" "}
                  {formatPrice(product.sellingPrice)}
                </span>
                <span>
                  <span className="font-medium">Cost:</span>{" "}
                  {formatPrice(product.purchasePrice)}
                </span>
              </div>

              {/* Stock Information */}
              {product.stock !== undefined && product.stock !== null && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Stock:</span> {product.stock}{" "}
                  units
                </div>
              )}

              {/* Status Indicators */}
              {status === "pending" && (
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </div>
              )}

              {status === "error" && (
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                  <AlertTriangle className="w-3 h-3" />
                  Failed to save
                </div>
              )}

              {status === "success" && (
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  ✓ Saved successfully
                </div>
              )}
            </div>

            {/* Edit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditProduct(product)}
              className="ml-2 h-8 w-8 p-0"
              disabled={status === "pending"}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        </div>
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
