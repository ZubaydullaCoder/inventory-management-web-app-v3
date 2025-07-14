"use client";

import { Pencil, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumericFormat } from "react-number-format";

/**
 * @typedef {Object} ProductSessionItemProps
 * @property {object} product - The product data object
 * @property {string} status - The status of the product ("pending" | "error" | "success")
 * @property {Function} onEdit - Handler for edit action
 */

/**
 * Renders a single product in the session creation list with status and actions.
 *
 * @param {ProductSessionItemProps} props
 * @returns {JSX.Element}
 */
export default function ProductSessionCreationItem({
  product,
  status,
  onEdit,
}) {
  const canEdit =
    status === "success" && product.id && !product.id.startsWith("optimistic");

  return (
    <div
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
              <NumericFormat
                value={product.sellingPrice}
                displayType="text"
                thousandSeparator=" "
                decimalScale={0}
                suffix=" so'm"
              />
            </span>
            <span>
              <span className="font-medium">Cost:</span>{" "}
              <NumericFormat
                value={product.purchasePrice}
                displayType="text"
                thousandSeparator=" "
                decimalScale={0}
                suffix=" so'm"
              />
            </span>
          </div>

          {/* Stock Information */}
          {product.stock !== undefined && product.stock !== null && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Stock:</span> {product.stock}{" "}
              {product.unit || "units"}
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
          onClick={() => onEdit(product)}
          className="ml-2 h-8 w-8 p-0"
          disabled={!canEdit}
          title={
            canEdit ? "Edit product" : "Product must be saved before editing"
          }
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
