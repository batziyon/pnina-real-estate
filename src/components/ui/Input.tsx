/**
 * Input Component — Design System
 * 
 * Professional form input with consistent styling and RTL support.
 */

import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      isRequired = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label?.replace(/\s+/g, "-")}`;

    const baseInputStyles =
      "block w-full px-4 py-2.5 text-gray-900 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";

    const errorStyles = error
      ? "border-red-500 focus:ring-red-600"
      : "border-gray-300 hover:border-gray-400";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-900 mb-1.5"
          >
            {label}
            {isRequired && <span className="text-red-600 mr-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`${baseInputStyles} ${errorStyles} ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
          }
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}

        {helpText && !error && (
          <p id={`${inputId}-help`} className="mt-1.5 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
