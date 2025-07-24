"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";

/**
 * Search filter component for categories with debounced input
 * @param {Object} props
 * @param {function} props.onSearchChange - Callback when search value changes
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {string} [props.value] - Controlled search value
 */
export default function CategorySearchFilter({
  onSearchChange,
  placeholder = "Search categories...",
  value: controlledValue,
}) {
  const [searchValue, setSearchValue] = useState(controlledValue || "");
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  // Call onSearchChange when debounced value changes
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearchChange]);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleSearchChange}
        className="pl-10"
      />
    </div>
  );
}
