import { cn } from "@/lib/utils";

/**
 * Reusable skeleton component for individual table cells based on column type.
 * Provides adaptive skeleton widths based on typical content patterns.
 *
 * @param {Object} props
 * @param {string} props.columnId - The column ID to determine skeleton style
 * @param {string} [props.className] - Additional CSS classes
 */
export function TableCellSkeleton({ columnId, className, ...props }) {
  // Different skeleton widths based on typical column content across different data types
  const skeletonStyles = {
    // Product-specific columns
    name: "h-4 w-[120px]", // Product names are typically longer
    sellingPrice: "h-4 w-[60px]", // Prices are shorter
    purchasePrice: "h-4 w-[60px]",
    stock: "h-4 w-[40px]", // Stock numbers are short
    unit: "h-4 w-[50px]", // Units are short
    category: "h-4 w-[80px]", // Category names are medium
    supplier: "h-4 w-[80px]", // Supplier names are medium

    // Customer-specific columns
    customerName: "h-4 w-[100px]", // Customer names
    email: "h-4 w-[140px]", // Email addresses are longer
    phone: "h-4 w-[90px]", // Phone numbers
    address: "h-4 w-[160px]", // Addresses are longer

    // Sales-specific columns
    totalAmount: "h-4 w-[70px]", // Sales amounts
    quantity: "h-4 w-[40px]", // Quantities are short
    discount: "h-4 w-[50px]", // Discount values

    // Common columns across entities
    createdAt: "h-4 w-[80px]", // Dates are consistent
    updatedAt: "h-4 w-[80px]",
    status: "h-4 w-[60px]", // Status badges
    description: "h-4 w-[200px]", // Descriptions are longer
    notes: "h-4 w-[150px]", // Notes are variable but longer

    // Action columns
    actions: "h-4 w-[80px]", // Action buttons are consistent

    // Default fallback
    default: "h-4 w-[60px]",
  };

  const skeletonClass = skeletonStyles[columnId] || skeletonStyles.default;

  return (
    <div className={cn("animate-pulse", className)} {...props}>
      <div className={cn("bg-muted rounded", skeletonClass)} />
    </div>
  );
}
