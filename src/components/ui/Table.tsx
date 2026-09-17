/**
 * Table Component — Design System
 * 
 * Professional data table with consistent styling and RTL support.
 */

import { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

export interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse ${className}`}>
        {children}
      </table>
    </div>
  );
}

export interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>{children}</tr>
    </thead>
  );
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableHead({ children, className = "", ...props }: TableHeadProps) {
  return (
    <th
      className={`px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
}

export interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className = "" }: TableRowProps) {
  const interactiveClass = onClick
    ? "cursor-pointer hover:bg-gray-50 transition-colors"
    : "";

  return (
    <tr className={`${interactiveClass} ${className}`} onClick={onClick}>
      {children}
    </tr>
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableCell({ children, className = "", ...props }: TableCellProps) {
  return (
    <td
      className={`px-4 py-3 text-sm text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
