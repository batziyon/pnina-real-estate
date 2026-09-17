/**
 * Admin Properties API
 *
 * Demonstrates authentication and authorization patterns:
 * - Authentication via requireAuth()
 * - Role-based filtering (AGENT sees only own properties)
 * - Actor passed to use case for agentId assignment
 *
 * POST /api/admin/properties - Create property
 * GET  /api/admin/properties - List properties (with role-based filtering)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import type { PropertyFilters } from "@/domain/property/property.types";

/**
 * POST /api/admin/properties
 *
 * Create a new property.
 * agentId assignment is server-controlled based on actor role.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse body
    const body = await request.json();

    // STEP 1 SESSION VERIFICATION LOGGING
    console.log("\n========== POST /api/admin/properties ==========");
    console.log("✓ Session actor verified:");
    console.log("  - id:    ", actor.id);
    console.log("  - email: ", actor.email);
    console.log("  - role:  ", actor.role);
    console.log("Expected ID after fresh login: cmu5p56oa001lu8u4ady241vk");
    console.log("Request body:", JSON.stringify(body, null, 2));
    console.log("================================================\n");

    // 3. Call use case (agentId assignment happens inside use case)
    const property = await useCases.properties.create.execute(body, {
      id: actor.id,
      role: actor.role,
    });

    console.log("\n✓ Property created successfully:", property.id);

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("\n✗ POST /api/admin/properties FAILED:");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    if (error && typeof error === 'object' && 'fields' in error) {
      console.error("Validation fields:", error.fields);
    }
    console.error("\n");
    return handleApiError(error);
  }
}

/**
 * GET /api/admin/properties
 *
 * List properties with role-based filtering.
 * - ADMIN/EDITOR: see all properties
 * - AGENT: see only properties where agentId = actor.id
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20", 10);
    const status = searchParams.get("status") ?? undefined;

    // 3. Role-based filtering
    const filters: PropertyFilters = {};

    if (status) {
      filters.status = status as PropertyFilters["status"];
    }

    // AGENT can only see their own properties
    if (actor.role === "AGENT") {
      filters.agentId = actor.id;
    }
    // ADMIN and EDITOR see all properties

    // 4. Call use case
    const result = await useCases.properties.list.execute(filters, {
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
