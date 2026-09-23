"use client";

/**
 * Admin Sidebar Navigation — Professional Real Estate CRM
 * Pnina Real Estate
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import type { AuthenticatedUser } from "@/lib/auth-helpers";

interface AdminSidebarProps {
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

export function AdminSidebar({ user }: AdminSidebarProps) {
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

  // Group navigation items
  const groupedNav = {
    main: visibleNav.filter((item) => item.group === "main"),
    crm: visibleNav.filter((item) => item.group === "crm"),
    settings: visibleNav.filter((item) => item.group === "settings"),
  };

  return (
    <aside className="hidden lg:flex lg:w-64 bg-[#135C87] flex-col">
      {/* Logo/Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="relative w-full h-16">
          <Image
            src="/images/pnina-logo.png"
            alt="פנינה נדל״ן"
            fill
            sizes="(max-width: 768px) 100vw, 256px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* Main Section */}
        {groupedNav.main.length > 0 && (
          <div className="space-y-0.5">
            {groupedNav.main.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-3 py-2 text-sm font-medium rounded transition-colors
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
          </div>
        )}

        {/* CRM Section */}
        {groupedNav.crm.length > 0 && (
          <div className="space-y-0.5">
            <h3 className="px-3 text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-2">
              ניהול לקוחות
            </h3>
            {groupedNav.crm.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-3 py-2 text-sm font-medium rounded transition-colors
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
          </div>
        )}

        {/* Settings Section */}
        {groupedNav.settings.length > 0 && (
          <div className="space-y-0.5">
            <h3 className="px-3 text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-2">
              הגדרות
            </h3>
            {groupedNav.settings.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-3 py-2 text-sm font-medium rounded transition-colors
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
          </div>
        )}
      </nav>

      {/* User info */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <span className="text-[#135C87] font-semibold text-sm">
              {user.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-[10px] text-white/70">{getRoleLabel(user.role)}</p>
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
