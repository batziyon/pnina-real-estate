/**
 * Select Component — Design System
 * 
 * Professional dropdown select with consistent styling and RTL support.
 */

import { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  isRequired?: boolean;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helpText,
      isRequired = false,
      options,
      placeholder,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${label?.replace(/\s+/g, "-")}`;

    const baseSelectStyles =
      "block w-full px-4 py-2.5 text-gray-900 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed appearance-none bg-white";

    const errorStyles = error
      ? "border-red-500 focus:ring-red-600"
      : "border-gray-300 hover:border-gray-400";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-900 mb-1.5"
          >
            {label}
            {isRequired && <span className="text-red-600 mr-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`${baseSelectStyles} ${errorStyles} ${className}`}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helpText
                ? `${selectId}-help`
                : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}

        {helpText && !error && (
          <p id={`${selectId}-help`} className="mt-1.5 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
