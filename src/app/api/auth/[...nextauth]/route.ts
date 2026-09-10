/**
 * Auth.js Route Handler
 *
 * Handles all authentication routes:
 * - POST /api/auth/signin
 * - GET  /api/auth/signout
 * - POST /api/auth/signout
 * - GET  /api/auth/session
 * - etc.
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
