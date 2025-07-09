"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 * Reusable number input field component for forms.
 * Handles number-specific props and validation.
 *
 * @param {{
 *   control: any,
 *   name: string,
 *   label: string,
 *   placeholder?: string,
 *   step?: string,
 *   min?: string,
 *   required?: boolean
 * }} props
 * @returns {JSX.Element}
 */
export default function NumberField({
  control,
  name,
  label,
  placeholder = "0",
  step,
  min = "0",
  required = false,
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            {label}
            {required && " *"}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              step={step}
              min={min}
              placeholder={placeholder}
              {...field}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
