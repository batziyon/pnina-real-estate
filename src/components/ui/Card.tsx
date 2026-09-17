/**
 * Card Component — Design System
 * 
 * Professional container with subtle shadow and border.
 * Used for grouping content with visual hierarchy.
 */

import { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 ${className}`}
      {...props}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

export function CardContent({
  children,
  padding = "md",
  className = "",
  ...props
}: CardContentProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div className={`${paddingClasses[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
