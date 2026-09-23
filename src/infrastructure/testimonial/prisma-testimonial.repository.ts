import "server-only";
import type { Testimonial as PrismaTestimonial } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { TestimonialRepository } from "@/domain/testimonial/testimonial.repository";
import type {
  CreateTestimonialInput,
  TestimonialData,
  TestimonialFilters,
  UpdateTestimonialInput,
} from "@/domain/testimonial/testimonial.types";
import type { PaginationMeta, PaginationParams } from "@/types";

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function toTestimonialData(record: PrismaTestimonial): TestimonialData {
  return {
    id: record.id,
    name: record.name,
    displayName: record.displayName,
    content: record.content,
    status: record.status as TestimonialData["status"],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildWhere(filters: TestimonialFilters) {
  return {
    ...(filters.status !== undefined && { status: filters.status }),
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

export class PrismaTestimonialRepository implements TestimonialRepository {
  async findById(id: string): Promise<TestimonialData | null> {
    const record = await prisma.testimonial.findUnique({ where: { id } });
    return record ? toTestimonialData(record) : null;
  }

  async findMany(
    filters: TestimonialFilters,
    pagination: PaginationParams
  ): Promise<{ data: TestimonialData[]; meta: PaginationMeta }> {
    const where = buildWhere(filters);
    const skip = (pagination.page - 1) * pagination.pageSize;

    const [records, total] = await prisma.$transaction([
      prisma.testimonial.findMany({
        where,
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.testimonial.count({ where }),
    ]);

    return {
      data: records.map(toTestimonialData),
      meta: buildMeta(total, pagination),
    };
  }

  /**
   * Returns only APPROVED testimonials.
   * Domain rule: a testimonial is publicly publishable only when status = APPROVED.
   * This query enforces that rule at the data layer — no caller can bypass it.
   */
  async findApproved(): Promise<TestimonialData[]> {
    const records = await prisma.testimonial.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    return records.map(toTestimonialData);
  }

  async create(input: CreateTestimonialInput): Promise<TestimonialData> {
    const record = await prisma.testimonial.create({
      data: {
        name: input.name,
        displayName: input.displayName ?? null,
        content: input.content,
        status: "PENDING",
      },
    });
    return toTestimonialData(record);
  }

  async update(
    id: string,
    input: UpdateTestimonialInput
  ): Promise<TestimonialData> {
    const record = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.displayName !== undefined && { displayName: input.displayName }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });
    return toTestimonialData(record);
  }

  async count(filters: TestimonialFilters): Promise<number> {
    return prisma.testimonial.count({ where: buildWhere(filters) });
  }

  async countPending(): Promise<number> {
    return prisma.testimonial.count({ where: { status: "PENDING" } });
  }
}
