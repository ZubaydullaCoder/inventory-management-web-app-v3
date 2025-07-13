"use client";

import { NumericFormat } from "react-number-format";
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
 * Uses react-number-format for enhanced UX with automatic thousands separators.
 *
 * @param {{
 *   control: any,
 *   name: string,
 *   label: string,
 *   placeholder?: string,
 *   step?: string,
 *   min?: string,
 *   required?: boolean,
 *   decimalScale?: number,
 *   allowNegative?: boolean,
 *   prefix?: string,
 *   suffix?: string
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
  decimalScale = 2,
  allowNegative = false,
  prefix = "",
  suffix = "",
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
            <NumericFormat
              customInput={Input}
              thousandSeparator=" "
              decimalScale={decimalScale}
              fixedDecimalScale={decimalScale > 0}
              allowNegative={allowNegative}
              prefix={prefix}
              suffix={suffix}
              placeholder={placeholder}
              value={field.value || ""}
              onValueChange={(values) => {
                // Extract the numeric value and pass it to react-hook-form
                // If the field is empty, pass empty string to maintain form state
                field.onChange(values.value === "" ? "" : values.value);
              }}
              onBlur={field.onBlur}
              name={field.name}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
