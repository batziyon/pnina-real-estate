/**
 * Alert Component — Design System
 * 
 * Contextual feedback messages for success, warning, error, info states.
 */

import { ReactNode } from "react";

export interface AlertProps {
  variant?: "success" | "warning" | "error" | "info";
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
}: AlertProps) {
  const variants = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
    },
    warning: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
    },
  };

  const style = variants[variant];

  return (
    <div
      className={`${style.bg} ${style.border} border p-4`}
      role="alert"
    >
      <div className="flex gap-3">
        <div className="flex-1">
          {title && (
            <h3 className={`font-semibold ${style.text} mb-1 text-sm`}>{title}</h3>
          )}
          <div className={`text-sm ${style.text}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${style.text} hover:opacity-70 transition-opacity`}
            aria-label="סגור"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
