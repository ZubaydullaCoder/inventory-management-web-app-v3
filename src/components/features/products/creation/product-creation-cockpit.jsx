// src/components/features/products/product-creation-cockpit.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import ProductCreationForm from "@/components/features/products/creation/product-creation-form";
import ProductSessionCreationList from "@/components/features/products/creation/product-session-creation-list";

/**
 * Client-side wrapper for the product creation cockpit.
 * Manages the local state for products created within this session
 * to provide a fully optimistic UI.
 *
 * @returns {JSX.Element} The interactive two-column cockpit layout.
 */
export default function ProductCreationCockpit() {
  // State is now held locally in this client component.
  // Use TanStack Query to manage session products in cache
  // This is a local-only cache that doesn't fetch from server
  const { data: sessionProducts = [] } = useQuery({
    queryKey: queryKeys.products.sessionCreations(),
    queryFn: () => [], // Return empty array as this is local-only
    staleTime: Infinity, // Never refetch as this is session-based
    gcTime: 0, // Clear on unmount to ensure fresh session on page refresh
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
      {/* Left Column: Product Form with integrated category management */}
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Product Details
          </h2>
          <ProductCreationForm />
        </div>
      </div>

      {/* Right Column: Session Creation List */}
      <div className="flex flex-col space-y-4">
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col flex-1 min-h-0">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex-shrink-0">
            Recently Added
          </h2>
          <div className="flex-1 min-h-0">
            <ProductSessionCreationList products={sessionProducts} />
          </div>
        </div>
      </div>
    </div>
  );
}
