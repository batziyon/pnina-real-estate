"use client";

/**
 * Admin Sidebar Navigation — Hebrew RTL
 *
 * Client Component for navigation and active state tracking.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthenticatedUser } from "@/lib/auth-helpers";

interface AdminSidebarProps {
  user: AuthenticatedUser;
}

const navigation = [
  { name: "לוח בקרה", href: "/admin", icon: "📊" },
  { name: "נכסים", href: "/admin/properties", icon: "🏢" },
  { name: "✨ יצירת נכס באמצעות AI", href: "/admin/properties/ai-new", icon: "🤖", agentAccess: true },
  { name: "פרויקטים", href: "/admin/projects", icon: "🏗️" },
  { name: "פניות", href: "/admin/inquiries", icon: "📬" },
  { name: "הערכות שווי", href: "/admin/valuations", icon: "💰" },
  { name: "המלצות", href: "/admin/testimonials", icon: "⭐", adminOnly: true },
  { name: "משתמשים", href: "/admin/users", icon: "👥", adminOnly: true },
  { name: "הגדרות", href: "/admin/settings", icon: "⚙️", adminOnly: true },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  // Filter navigation based on role
  const visibleNav = navigation.filter((item) => {
    // Admin-only items
    if (item.adminOnly && user.role !== "ADMIN") {
      return false;
    }
    // Agent-access items (ADMIN and AGENT only)
    if (item.agentAccess && user.role !== "ADMIN" && user.role !== "AGENT") {
      return false;
    }
    return true;
  });

  return (
    <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">פנינה נדל&quot;ן</h1>
        <p className="text-sm text-gray-500 mt-1">ניהול נכסים</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-700 font-semibold">
              {user.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
          </div>
        </div>
      </div>
    </aside>
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
