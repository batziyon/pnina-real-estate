/**
 * Textarea Component — Design System
 * 
 * Professional multiline text input with consistent styling and RTL support.
 */

import { TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  isRequired?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helpText,
      isRequired = false,
      className = "",
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${label?.replace(/\s+/g, "-")}`;

    const baseTextareaStyles =
      "block w-full px-4 py-2.5 text-gray-900 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-vertical";

    const errorStyles = error
      ? "border-red-500 focus:ring-red-600"
      : "border-gray-300 hover:border-gray-400";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-900 mb-1.5"
          >
            {label}
            {isRequired && <span className="text-red-600 mr-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`${baseTextareaStyles} ${errorStyles} ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helpText
              ? `${textareaId}-help`
              : undefined
          }
          {...props}
        />

        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}

        {helpText && !error && (
          <p id={`${textareaId}-help`} className="mt-1.5 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
