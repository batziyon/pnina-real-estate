"use client";

/**
 * Admin Header — Hebrew RTL
 *
 * Client Component for header actions (logout, etc.)
 */

import type { AuthenticatedUser } from "@/lib/auth-helpers";
import { LogoutButton } from "./LogoutButton";

interface AdminHeaderProps {
  user: AuthenticatedUser;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            שלום, {user.name}
          </h2>
          <p className="text-sm text-gray-500">{getRoleLabel(user.role)}</p>
        </div>

        <div className="flex items-center gap-4">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "מנהל מערכת",
    AGENT: "סוכן נדל״ן",
    EDITOR: "עורך תוכן",
  };
  return labels[role] || role;
}
