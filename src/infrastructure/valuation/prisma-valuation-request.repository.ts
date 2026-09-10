import "server-only";
import type { ValuationRequest as PrismaValuationRequest } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ValuationRequestRepository } from "@/domain/valuation/valuation.repository";
import type {
  CreateValuationRequestInput,
  UpdateValuationRequestInput,
  ValuationRequestData,
  ValuationRequestFilters,
} from "@/domain/valuation/valuation.types";
import type { PaginationMeta, PaginationParams } from "@/types";

// ---------------------------------------------------------------------------
// Mapper — Decimal fields converted to string
// ---------------------------------------------------------------------------

function toValuationRequestData(
  record: PrismaValuationRequest
): ValuationRequestData {
  return {
    id: record.id,
    name: record.name,
    phone: record.phone,
    email: record.email,
    neighborhoodId: record.neighborhoodId,
    address: record.address,
    propertyType: record.propertyType as ValuationRequestData["propertyType"],
    rooms: record.rooms !== null ? record.rooms.toString() : null,
    area: record.area !== null ? record.area.toString() : null,
    message: record.message,
    status: record.status as ValuationRequestData["status"],
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildWhere(filters: ValuationRequestFilters) {
  return {
    ...(filters.status !== undefined && { status: filters.status }),
    ...(filters.neighborhoodId !== undefined && {
      neighborhoodId: filters.neighborhoodId,
    }),
  };
}

function buildMeta(
  total: number,
  { page, pageSize }: PaginationParams
): PaginationMeta {
  return { page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class PrismaValuationRequestRepository
  implements ValuationRequestRepository
{
  async findById(id: string): Promise<ValuationRequestData | null> {
    const record = await prisma.valuationRequest.findUnique({ where: { id } });
    return record ? toValuationRequestData(record) : null;
  }

  async findMany(
    filters: ValuationRequestFilters,
    pagination: PaginationParams
  ): Promise<{ data: ValuationRequestData[]; meta: PaginationMeta }> {
    const where = buildWhere(filters);
    const skip = (pagination.page - 1) * pagination.pageSize;

    const [records, total] = await prisma.$transaction([
      prisma.valuationRequest.findMany({
        where,
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.valuationRequest.count({ where }),
    ]);

    return {
      data: records.map(toValuationRequestData),
      meta: buildMeta(total, pagination),
    };
  }

  async create(
    input: CreateValuationRequestInput
  ): Promise<ValuationRequestData> {
    const record = await prisma.valuationRequest.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        neighborhoodId: input.neighborhoodId,
        address: input.address ?? null,
        propertyType: input.propertyType ?? null,
        rooms: input.rooms ?? null,
        area: input.area ?? null,
        message: input.message ?? null,
        status: "NEW",
      },
    });
    return toValuationRequestData(record);
  }

  async update(
    id: string,
    input: UpdateValuationRequestInput
  ): Promise<ValuationRequestData> {
    const record = await prisma.valuationRequest.update({
      where: { id },
      data: {
        ...(input.status !== undefined && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
    return toValuationRequestData(record);
  }

  async count(filters: ValuationRequestFilters): Promise<number> {
    return prisma.valuationRequest.count({ where: buildWhere(filters) });
  }

  async countNew(): Promise<number> {
    return prisma.valuationRequest.count({ where: { status: "NEW" } });
  }
}
