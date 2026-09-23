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
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <AdminSidebar user={user} />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Nav */}
          <div className="lg:hidden">
            <AdminMobileNav user={user} />
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            <AdminHeader user={user} />
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
