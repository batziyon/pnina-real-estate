import "server-only";
import type { Inquiry as PrismaInquiry } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { InquiryRepository } from "@/domain/inquiry/inquiry.repository";
import type {
  CreateInquiryInput,
  InquiryData,
  InquiryFilters,
  UpdateInquiryInput,
} from "@/domain/inquiry/inquiry.types";
import type { PaginationMeta, PaginationParams } from "@/types";

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function toInquiryData(record: PrismaInquiry): InquiryData {
  return {
    id: record.id,
    propertyId: record.propertyId,
    agentId: record.agentId,
    name: record.name,
    phone: record.phone,
    email: record.email,
    message: record.message,
    type: record.type as InquiryData["type"],
    status: record.status as InquiryData["status"],
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildWhere(filters: InquiryFilters) {
  return {
    ...(filters.status !== undefined && { status: filters.status }),
    ...(filters.type !== undefined && { type: filters.type }),
    ...(filters.agentId !== undefined && { agentId: filters.agentId }),
    ...(filters.propertyId !== undefined && { propertyId: filters.propertyId }),
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

export class PrismaInquiryRepository implements InquiryRepository {
  async findById(id: string): Promise<InquiryData | null> {
    const record = await prisma.inquiry.findUnique({ where: { id } });
    return record ? toInquiryData(record) : null;
  }

  async findMany(
    filters: InquiryFilters,
    pagination: PaginationParams
  ): Promise<{ data: InquiryData[]; meta: PaginationMeta }> {
    const where = buildWhere(filters);
    const skip = (pagination.page - 1) * pagination.pageSize;

    const [records, total] = await prisma.$transaction([
      prisma.inquiry.findMany({
        where,
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return { data: records.map(toInquiryData), meta: buildMeta(total, pagination) };
  }

  async create(input: CreateInquiryInput): Promise<InquiryData> {
    const record = await prisma.inquiry.create({
      data: {
        propertyId: input.propertyId,
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        message: input.message ?? null,
        type: input.type ?? "GENERAL_CONTACT",
        status: "NEW",
      },
    });
    return toInquiryData(record);
  }

  async update(id: string, input: UpdateInquiryInput): Promise<InquiryData> {
    const record = await prisma.inquiry.update({
      where: { id },
      data: {
        ...(input.agentId !== undefined && { agentId: input.agentId }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
    return toInquiryData(record);
  }

  async assign(id: string, agentId: string): Promise<InquiryData> {
    const record = await prisma.inquiry.update({
      where: { id },
      data: { agentId },
    });
    return toInquiryData(record);
  }

  async count(filters: InquiryFilters): Promise<number> {
    return prisma.inquiry.count({ where: buildWhere(filters) });
  }

  async countNew(): Promise<number> {
    return prisma.inquiry.count({ where: { status: "NEW" } });
  }
}
