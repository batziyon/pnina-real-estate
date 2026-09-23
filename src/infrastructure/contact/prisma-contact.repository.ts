import "server-only";
import type { Contact as PrismaContact } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type {
  ContactData,
  ContactFilters,
  CreateContactInput,
  UpdateContactInput,
  ContactRoleType,
} from "@/domain/contact/contact.types";
import type { PaginationMeta, PaginationParams } from "@/types";

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function toContactData(record: PrismaContact & { roles?: Array<{ role: string }> }): ContactData {
  return {
    id: record.id,
    name: record.name,
    phone: record.phone,
    email: record.email,
    notes: record.notes,
    assignedAgentId: record.assignedAgentId,
    roles: record.roles?.map(r => ({ role: r.role as ContactRoleType })),
    
    // Enhanced fields
    preferredName: record.preferredName,
    secondaryPhone: record.secondaryPhone,
    secondaryEmail: record.secondaryEmail,
    preferredCommunication: record.preferredCommunication,
    
    // Current situation
    currentCity: record.currentCity,
    currentNeighborhood: record.currentNeighborhood,
    currentAddress: record.currentAddress,
    currentPropertyStatus: record.currentPropertyStatus,
    
    // Seller opportunity
    interestedInSelling: record.interestedInSelling,
    sellingTimeframe: record.sellingTimeframe,
    sellingReason: record.sellingReason,
    valuationRequested: record.valuationRequested,
    valuationCompleted: record.valuationCompleted,
    
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

  // Filter by role
  if (filters.role) {
    conditions.push({
      roles: {
        some: {
          role: filters.role,
          active: true,
        },
      },
    });
  }

  // Filter by interested in selling
  if (filters.interestedInSelling !== undefined) {
    conditions.push({ interestedInSelling: filters.interestedInSelling });
  }

  // Filter by has active buyer requirement
  if (filters.hasActiveRequirement) {
    conditions.push({
      buyerRequirements: {
        some: {
          active: true,
        },
      },
    });
  }

  // Filter by has property interests
  if (filters.hasPropertyInterests) {
    conditions.push({
      propertyInterests: {
        some: {},
      },
    });
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
      include: {
        roles: {
          where: { active: true },
        },
      },
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
        include: {
          roles: {
            where: { active: true },
          },
        },
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
        // Enhanced fields
        preferredName: input.preferredName ?? null,
        secondaryPhone: input.secondaryPhone ?? null,
        secondaryEmail: input.secondaryEmail ?? null,
        preferredCommunication: input.preferredCommunication ?? null,
        currentCity: input.currentCity ?? null,
        currentNeighborhood: input.currentNeighborhood ?? null,
        currentAddress: input.currentAddress ?? null,
        currentPropertyStatus: input.currentPropertyStatus ?? null,
        interestedInSelling: input.interestedInSelling ?? false,
        sellingTimeframe: input.sellingTimeframe ?? null,
        sellingReason: input.sellingReason ?? null,
        // Roles
        ...(input.roles && input.roles.length > 0 && {
          roles: {
            create: input.roles.map(role => ({
              role,
              active: true,
            })),
          },
        }),
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
        // Enhanced fields
        ...(input.preferredName !== undefined && { preferredName: input.preferredName }),
        ...(input.secondaryPhone !== undefined && { secondaryPhone: input.secondaryPhone }),
        ...(input.secondaryEmail !== undefined && { secondaryEmail: input.secondaryEmail }),
        ...(input.preferredCommunication !== undefined && { preferredCommunication: input.preferredCommunication }),
        ...(input.currentCity !== undefined && { currentCity: input.currentCity }),
        ...(input.currentNeighborhood !== undefined && { currentNeighborhood: input.currentNeighborhood }),
        ...(input.currentAddress !== undefined && { currentAddress: input.currentAddress }),
        ...(input.currentPropertyStatus !== undefined && { currentPropertyStatus: input.currentPropertyStatus }),
        ...(input.interestedInSelling !== undefined && { interestedInSelling: input.interestedInSelling }),
        ...(input.sellingTimeframe !== undefined && { sellingTimeframe: input.sellingTimeframe }),
        ...(input.sellingReason !== undefined && { sellingReason: input.sellingReason }),
        ...(input.valuationRequested !== undefined && { valuationRequested: input.valuationRequested }),
        ...(input.valuationCompleted !== undefined && { valuationCompleted: input.valuationCompleted }),
      },
    });
    return toContactData(record);
  }

  async count(filters: ContactFilters): Promise<number> {
    return prisma.contact.count({ where: buildWhere(filters) });
  }

  async countByRole(role: string, additionalFilters?: Partial<ContactFilters>): Promise<number> {
    const filters: ContactFilters = {
      ...additionalFilters,
      role: role as any,
    };
    return prisma.contact.count({ where: buildWhere(filters) });
  }
}
