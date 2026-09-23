/**
 * Server-side fetch helpers for Next.js 15+ async cookies
 */

import { cookies } from "next/headers";

/**
 * Gets cookie header string for server-side fetch requests.
 * Handles Next.js 15+ async cookies API.
 */
export async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}
