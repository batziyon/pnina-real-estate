/**
 * Admin Login Page — Hebrew RTL
 *
 * Server Component that renders the login form.
 * Uses Auth.js Credentials provider for authentication.
 *
 * Flow:
 * 1. User enters email + password
 * 2. Form submits to Auth.js signIn action
 * 3. Auth.js calls LoginUseCase (server-side)
 * 4. On success: redirect to /admin
 * 5. On failure: display error message
 *
 * Security:
 * - Authentication handled by Auth.js
 * - No database code in UI
 * - Credentials provider configured in auth.ts
 */

import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "התחברות | ניהול נכסים",
  description: "התחברות למערכת ניהול הנכסים",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            פנינה נדל&quot;ן
          </h1>
          <p className="text-gray-600">מערכת ניהול נכסים</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            התחברות למערכת
          </h2>

          <LoginForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            © 2026 פנינה נדל&quot;ן. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </div>
  );
}
