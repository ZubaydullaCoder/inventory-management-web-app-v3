"use client";

import { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

/**
 * Common units of measure for inventory items.
 * These can be easily extended based on business needs.
 */
const COMMON_UNITS = [
  { value: "pieces", label: "Pieces" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "lbs", label: "Pounds (lbs)" },
  { value: "liters", label: "Liters" },
  { value: "ml", label: "Milliliters (ml)" },
  { value: "boxes", label: "Boxes" },
  { value: "packs", label: "Packs" },
  { value: "bottles", label: "Bottles" },
  { value: "meters", label: "Meters (m)" },
  { value: "feet", label: "Feet (ft)" },
  { value: "custom", label: "Custom..." },
];

/**
 * Unit selection field component with common units dropdown and custom input option.
 *
 * @param {{
 *   control: object,
 *   name: string,
 *   label?: string,
 *   required?: boolean
 * }} props
 * @returns {JSX.Element}
 */
export default function UnitSelectField({
  control,
  name = "unit",
  label = "Unit of Measure",
  required = false,
}) {
  const [isCustom, setIsCustom] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleSelectChange = (value) => {
          if (value === "custom") {
            setIsCustom(true);
            field.onChange(""); // Clear the field for custom input
          } else {
            setIsCustom(false);
            field.onChange(value);
          }
        };

        const handleCustomInputChange = (e) => {
          field.onChange(e.target.value);
        };

        // Determine if we should show custom input
        const showCustomInput =
          isCustom ||
          (field.value &&
            !COMMON_UNITS.find(
              (u) => u.value === field.value && u.value !== "custom"
            ));

        return (
          <FormItem>
            <FormLabel>
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl>
              {showCustomInput ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter custom unit (e.g., dozen, yards)"
                    value={field.value || ""}
                    onChange={handleCustomInputChange}
                    onBlur={field.onBlur}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustom(false);
                      field.onChange("");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    ← Back to common units
                  </button>
                </div>
              ) : (
                <Select
                  onValueChange={handleSelectChange}
                  value={field.value || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit of measure" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
