/**
 * Admin Layout — Hebrew RTL Interface
 *
 * Server Component that wraps all admin pages.
 * Provides authentication check, sidebar navigation, and header.
 */

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  let user;
  try {
    user = await requireAuth();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar user={user} />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader user={user} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
