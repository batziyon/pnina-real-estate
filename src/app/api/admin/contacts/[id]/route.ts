/**
 * Admin Contact Detail API
 *
 * GET    /api/admin/contacts/[id] - Get single contact
 * PATCH  /api/admin/contacts/[id] - Update contact
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { toContactAdminDTO } from "@/controllers/dtos";

/**
 * GET /api/admin/contacts/[id]
 *
 * Fetch a single contact.
 * - ADMIN: can view any contact
 * - AGENT: can only view contacts assigned to them
 * - EDITOR: unauthorized
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Get contact ID
    const { id } = await context.params;

    // 3. Call use case (authorization happens inside use case)
    const contact = await useCases.contacts.get.execute(id, {
      id: actor.id,
      role: actor.role,
    });

    // 4. Fetch assigned agent if present
    const assignedAgent = contact.assignedAgentId
      ? await useCases.users.get.execute(contact.assignedAgentId)
      : null;

    return NextResponse.json(toContactAdminDTO(contact, assignedAgent));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/contacts/[id]
 *
 * Update a contact.
 * - ADMIN: can update any contact and reassign to any active AGENT
 * - AGENT: can only update contacts assigned to them, cannot transfer
 * - EDITOR: unauthorized
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Get contact ID
    const { id } = await context.params;

    // 3. Parse body
    const body = await request.json();

    // 4. Call use case (authorization and assignedAgentId handling inside use case)
    const contact = await useCases.contacts.update.execute(
      id,
      body,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    // 5. Fetch assigned agent if present
    const assignedAgent = contact.assignedAgentId
      ? await useCases.users.get.execute(contact.assignedAgentId)
      : null;

    return NextResponse.json(toContactAdminDTO(contact, assignedAgent));
  } catch (error) {
    return handleApiError(error);
  }
}
