"use client";

/**
 * Login Form Component — Hebrew RTL
 *
 * Client Component for login form UI and state management.
 * Submits to Auth.js signIn server action.
 *
 * Features:
 * - Email + Password fields
 * - Client-side validation
 * - Loading state during authentication
 * - Hebrew error messages
 * - Redirect to /admin on success
 *
 * Security:
 * - Uses Auth.js signIn (server action)
 * - No direct database access
 * - Credentials validated server-side
 */

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * Inner component that uses useSearchParams
 * Wrapped in Suspense boundary by parent
 */
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Check for error from URL (Auth.js redirect with error)
  const urlError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email || !password) {
      setError("נא למלא את כל השדות");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("כתובת אימייל לא תקינה");
      return;
    }

    startTransition(async () => {
      try {
        // Call Auth.js signIn with credentials
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false, // Handle redirect manually
        });

        if (result?.error) {
          // Authentication failed
          setError("אימייל או סיסמה שגויים");
        } else if (result?.ok) {
          // Authentication succeeded — redirect to admin
          router.push("/admin");
          router.refresh();
        } else {
          // Unknown error
          setError("אירעה שגיאה. נסה שוב.");
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("אירעה שגיאה בהתחברות. נסה שוב.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {(error || urlError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 text-center">
            {error || "שגיאה בהתחברות. נסה שוב."}
          </p>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          כתובת אימייל
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="example@domain.com"
        />
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          סיסמה
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="••••••••"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "מתחבר..." : "התחברות"}
      </button>

      {/* Info Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          מערכת מאובטחת למשתמשים מורשים בלבד
        </p>
      </div>
    </form>
  );
}

/**
 * LoginForm with Suspense boundary
 * Wraps LoginFormContent to satisfy Next.js useSearchParams requirement
 */
export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginFormContent />
    </Suspense>
  );
}

/**
 * Loading skeleton for LoginForm
 */
function LoginFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-gray-200 rounded-lg" />
      <div className="h-20 bg-gray-200 rounded-lg" />
      <div className="h-12 bg-gray-300 rounded-lg" />
    </div>
  );
}
