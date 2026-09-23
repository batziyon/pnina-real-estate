"use client";

/**
 * Admin Mobile Navigation
 * Responsive mobile header with drawer menu for small screens
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthenticatedUser } from "@/lib/auth-helpers";
import { LogoutButton } from "./LogoutButton";

interface AdminMobileNavProps {
  user: AuthenticatedUser;
}

const navigation = [
  { name: "לוח בקרה", href: "/admin", group: "main" },
  { name: "נכסים", href: "/admin/properties", group: "main" },
  { name: "פרויקטים", href: "/admin/projects", group: "main" },
  { name: "אנשי קשר", href: "/admin/contacts", agentAccess: true, group: "crm" },
  { name: "פניות", href: "/admin/inquiries", group: "crm" },
  { name: "הערכות שווי", href: "/admin/valuations", group: "crm" },
  { name: "המלצות", href: "/admin/testimonials", adminOnly: true, group: "settings" },
  { name: "משתמשים", href: "/admin/users", adminOnly: true, group: "settings" },
  { name: "הגדרות", href: "/admin/settings", adminOnly: true, group: "settings" },
];

export function AdminMobileNav({ user }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Filter navigation based on role
  const visibleNav = navigation.filter((item) => {
    if (item.adminOnly && user.role !== "ADMIN") {
      return false;
    }
    if (item.agentAccess && user.role !== "ADMIN" && user.role !== "AGENT") {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-[#135C87] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-2"
            aria-label="תפריט"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-white font-semibold">פנינה נדל״ן</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-white text-sm">{user.name}</div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <span className="text-[#135C87] font-semibold text-sm">
              {user.name.charAt(0)}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-[#135C87] z-50 shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="text-white font-semibold">תפריט ניווט</div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white p-1"
                aria-label="סגור"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="px-3 py-4 space-y-1">
              {visibleNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      block px-3 py-3 text-sm font-medium rounded transition-colors
                      ${
                        isActive
                          ? "bg-white text-[#135C87]"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Actions */}
            <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-white/10 bg-[#135C87]">
              <div className="space-y-2">
                <div className="text-white/70 text-xs">{getRoleLabel(user.role)}</div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "מנהל",
    AGENT: "סוכן",
    EDITOR: "עורך",
  };
  return labels[role] || role;
}
