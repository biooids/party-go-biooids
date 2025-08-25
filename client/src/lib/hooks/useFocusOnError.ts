// src/lib/hooks/useFocusOnError.ts

import { useEffect } from "react";
import { FieldErrors, UseFormSetFocus } from "react-hook-form";

/**
 * A custom hook that automatically focuses on the first form field
 * with a validation error when a form submission fails.
 *
 * @param errors The `errors` object from `react-hook-form`'s `formState`.
 * @param setFocus The `setFocus` function from `react-hook-form`.
 */
export const useFocusOnError = (
  errors: FieldErrors,
  setFocus: UseFormSetFocus<any>
) => {
  useEffect(() => {
    // Get the name of the first field that has an error.
    const firstErrorField = Object.keys(errors)[0];

    // If an error exists, programmatically set the focus to that field.
    if (firstErrorField) {
      setFocus(firstErrorField as any);
    }
  }, [errors, setFocus]); // Re-run this effect whenever the errors object changes.
};
