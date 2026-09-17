"use client";

/**
 * LoginForm Component — Pnina Real Estate Premium Design
 *
 * Client Component for login form with Auth.js integration.
 */

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

/**
 * Inner component that uses useSearchParams
 */
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const urlError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("אימייל או סיסמה שגויים");
        } else if (result?.ok) {
          router.push("/admin");
          router.refresh();
        } else {
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
      {(error || urlError) && (
        <Alert variant="error">
          {error || "שגיאה בהתחברות. נסה שוב."}
        </Alert>
      )}

      <Input
        label="דואר אלקטרוני"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@domain.com"
        required
        autoComplete="email"
        disabled={isPending}
      />

      <Input
        label="סיסמה"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="current-password"
        disabled={isPending}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isPending}
        disabled={isPending}
      >
        כניסה למערכת
      </Button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          מערכת מאובטחת למשתמשים מורשים בלבד
        </p>
      </div>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-gray-200 rounded-lg" />
      <div className="h-20 bg-gray-200 rounded-lg" />
      <div className="h-12 bg-gray-300 rounded-lg" />
    </div>
  );
}
