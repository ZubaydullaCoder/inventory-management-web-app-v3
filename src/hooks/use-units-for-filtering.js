"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

/**
 * API function to fetch unique units from existing products
 * @returns {Promise<Array<{unit: string, productCount: number}>>}
 */
async function getUniqueUnitsApi() {
  const response = await fetch("/api/products/units");
  
  if (!response.ok) {
    throw new Error("Failed to fetch product units");
  }
  return response.json();
}

/**
 * Hook to fetch units and transform them into filter options format.
 * This hook specifically prepares unit data for use in filtering components like DataTableFacetedFilter.
 * @returns {Object} Object containing loading state, error, and transformed options
 */
export function useUnitsForFiltering() {
  const { data: units, isLoading, error } = useQuery({
    queryKey: queryKeys.products.units(),
    queryFn: getUniqueUnitsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes - units don't change frequently
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  // Transform units into the options format expected by shadcn filter components
  const unitOptions = useMemo(() => {
    if (!units || !Array.isArray(units)) {
      return [];
    }

    return units.map((unitData) => ({
      label: unitData.unit || "No Unit", // Handle null/empty units
      value: unitData.unit || "", // Use empty string for null units
      count: unitData.productCount || 0, // Include product count for better UX
    }));
  }, [units]);

  return {
    unitOptions,
    isLoading,
    error,
    hasUnits: unitOptions.length > 0,
  };
}
