/**
 * Admin Contacts API
 *
 * POST /api/admin/contacts - Create contact
 * GET  /api/admin/contacts - List contacts (with role-based filtering)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { toContactAdminDTO } from "@/controllers/dtos";
import { ListContactsQuerySchema } from "@/validations/contact.schema";
import { ValidationError } from "@/application/errors";

/**
 * POST /api/admin/contacts
 *
 * Create a new contact.
 * assignedAgentId assignment is server-controlled based on actor role.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse body
    const body = await request.json();

    // 3. Call use case (assignedAgentId assignment happens inside use case)
    const contact = await useCases.contacts.create.execute(body, {
      id: actor.id,
      role: actor.role,
    });

    // 4. Fetch assigned agent if present (for DTO)
    const assignedAgent = contact.assignedAgentId
      ? await useCases.users.get.execute(contact.assignedAgentId)
      : null;

    return NextResponse.json(
      toContactAdminDTO(contact, assignedAgent),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/admin/contacts
 *
 * List contacts with role-based filtering.
 * - ADMIN: see all contacts
 * - AGENT: see only contacts where assignedAgentId = actor.id
 * - EDITOR: unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse and validate query params
    const { searchParams } = new URL(request.url);
    const queryParams = {
      search: searchParams.get("search") ?? undefined,
      assignedAgentId: searchParams.get("assignedAgentId") ?? undefined,
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "20",
    };

    const parsed = ListContactsQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "Invalid",
        ])
      );
      throw new ValidationError("Invalid query parameters.", fields);
    }

    const { search, assignedAgentId, page, pageSize } = parsed.data;

    // 3. Call use case (role-based filtering happens inside use case)
    const result = await useCases.contacts.list.execute(
      { search, assignedAgentId },
      { page, pageSize },
      { id: actor.id, role: actor.role }
    );

    // 4. Fetch assigned agents for all contacts (batch)
    const agentIds = [
      ...new Set(
        result.data
          .map((c) => c.assignedAgentId)
          .filter((id): id is string => id !== null)
      ),
    ];

    const agentsMap = new Map();
    if (agentIds.length > 0) {
      const agents = await Promise.all(
        agentIds.map((id) => useCases.users.get.execute(id))
      );
      agents.forEach((agent) => {
        if (agent) {
          agentsMap.set(agent.id, agent);
        }
      });
    }

    // 5. Build DTOs
    const items = result.data.map((contact) =>
      toContactAdminDTO(
        contact,
        contact.assignedAgentId
          ? agentsMap.get(contact.assignedAgentId)
          : null
      )
    );

    return NextResponse.json({
      items,
      pagination: result.meta,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
