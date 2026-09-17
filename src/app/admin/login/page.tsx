/**
 * Admin Login Page — Pnina Real Estate
 */

import { LoginForm } from "@/components/admin/LoginForm";
import Image from "next/image";

export const metadata = {
  title: "התחברות | פנינה נדל״ן",
  description: "התחברות למערכת ניהול הנכסים",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#135C87] flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="relative w-48 h-24 bg-white p-4 rounded">
              <Image
                src="/images/pnina-logo.jpg"
                alt="פנינה נדל״ן"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">כניסה למערכת</h2>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-white/20 p-8">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-6">
          © {new Date().getFullYear()} פנינה נדל״ן. כל הזכויות שמורות.
        </p>
      </div>
    </div>
  );
}
