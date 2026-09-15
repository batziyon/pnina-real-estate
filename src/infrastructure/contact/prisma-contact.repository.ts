import "server-only";
import type { Contact as PrismaContact } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type {
  ContactData,
  ContactFilters,
  CreateContactInput,
  UpdateContactInput,
} from "@/domain/contact/contact.types";
import type { PaginationMeta, PaginationParams } from "@/types";

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function toContactData(record: PrismaContact): ContactData {
  return {
    id: record.id,
    name: record.name,
    phone: record.phone,
    email: record.email,
    notes: record.notes,
    assignedAgentId: record.assignedAgentId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildWhere(filters: ContactFilters) {
  const conditions: Array<Record<string, unknown>> = [];

  // Search across name, phone, email
  if (filters.search) {
    const search = filters.search.trim();
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    });
  }

  // Filter by assigned agent
  if (filters.assignedAgentId !== undefined) {
    conditions.push({ assignedAgentId: filters.assignedAgentId });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

function buildMeta(
  total: number,
  { page, pageSize }: PaginationParams
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class PrismaContactRepository implements ContactRepository {
  async findById(id: string): Promise<ContactData | null> {
    const record = await prisma.contact.findUnique({
      where: { id },
    });
    return record ? toContactData(record) : null;
  }

  async findMany(
    filters: ContactFilters,
    pagination: PaginationParams
  ): Promise<{ data: ContactData[]; meta: PaginationMeta }> {
    const where = buildWhere(filters);
    const skip = (pagination.page - 1) * pagination.pageSize;

    const [records, total] = await prisma.$transaction([
      prisma.contact.findMany({
        where,
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.count({ where }),
    ]);

    return {
      data: records.map(toContactData),
      meta: buildMeta(total, pagination),
    };
  }

  async create(input: CreateContactInput): Promise<ContactData> {
    const record = await prisma.contact.create({
      data: {
        name: input.name,
        phone: input.phone ?? null,
        email: input.email ?? null,
        notes: input.notes ?? null,
        assignedAgentId: input.assignedAgentId ?? null,
      },
    });
    return toContactData(record);
  }

  async update(id: string, input: UpdateContactInput): Promise<ContactData> {
    const record = await prisma.contact.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.assignedAgentId !== undefined && {
          assignedAgentId: input.assignedAgentId,
        }),
      },
    });
    return toContactData(record);
  }

  async count(filters: ContactFilters): Promise<number> {
    return prisma.contact.count({ where: buildWhere(filters) });
  }
}
