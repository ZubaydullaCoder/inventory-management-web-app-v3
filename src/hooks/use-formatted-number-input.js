import { useState, useEffect } from "react";
import { formatNumberWithSpaces, parseNumberWithSpaces } from "@/lib/utils";

/**
 * Manages display formatting (spaces) and raw value sanitization for numeric inputs.
 *
 * @param {string|number} rawValue
 * @param {(val: string) => void} onChange
 * @param {string} [step]
 */
export function useFormattedNumberInput(rawValue, onChange, step) {
  const [displayValue, setDisplayValue] = useState(
    formatNumberWithSpaces(rawValue)
  );

  useEffect(() => {
    setDisplayValue(formatNumberWithSpaces(rawValue));
  }, [rawValue]);

  const handleChange = (e) => {
    const raw = parseNumberWithSpaces(e.target.value);
    const allowDecimal = step?.includes(".");
    let sanitized;

    if (allowDecimal) {
      sanitized = raw.replace(/[^0-9.]/g, "");
      const [intPart, ...rest] = sanitized.split(".");
      sanitized = intPart + (rest.length ? "." + rest.join("") : "");
    } else {
      sanitized = raw.replace(/\D/g, "");
    }

    onChange(sanitized);

    if (allowDecimal) {
      const [intPart, decimal] = sanitized.split(".", 2);
      const formattedInt = formatNumberWithSpaces(intPart);
      setDisplayValue(
        decimal !== undefined ? `${formattedInt}.${decimal}` : formattedInt
      );
    } else {
      setDisplayValue(formatNumberWithSpaces(sanitized));
    }
  };

  return { displayValue, handleChange };
}
