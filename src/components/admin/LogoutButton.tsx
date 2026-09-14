"use client";

/**
 * Logout Button — Client Component
 *
 * Handles logout action via Auth.js signOut.
 */

import { signOut } from "next-auth/react";

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
    >
      יציאה
    </button>
  );
}
