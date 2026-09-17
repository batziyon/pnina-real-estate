/**
 * Badge Component — Design System
 * 
 * Status indicators with consistent colors and styling.
 */

import { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full whitespace-nowrap";

  const variants = {
    default: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-orange-100 text-orange-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-cyan-100 text-cyan-800",
    neutral: "bg-gray-100 text-gray-800",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
