// src/components/ui/hidden-field.jsx

"use client";

import {
  FormField,
  FormItem,
  FormControl,
} from "@/components/ui/form";

/**
 * Reusable hidden field component for forms.
 * Provides a clean way to include hidden inputs in react-hook-form forms.
 * 
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.name - Field name
 * @param {string} [props.value] - Optional value to set (if not controlled by form)
 * @returns {JSX.Element}
 */
export function HiddenField({ control, name, value, ...props }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <input 
              type="hidden" 
              {...field} 
              value={value !== undefined ? value : field.value}
              {...props}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
