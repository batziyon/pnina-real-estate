import "server-only";
import type { Project as PrismaProject } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProjectRepository } from "@/domain/project/project.repository";
import type {
  CreateProjectInput,
  ProjectData,
  ProjectFilters,
  UpdateProjectInput,
} from "@/domain/project/project.types";
import type { PaginationMeta, PaginationParams } from "@/types";

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function toProjectData(record: PrismaProject): ProjectData {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    neighborhoodId: record.neighborhoodId,
    address: record.address,
    status: record.status as ProjectData["status"],
    coverImage: record.coverImage,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildWhere(filters: ProjectFilters) {
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

export class PrismaProjectRepository implements ProjectRepository {
  async findById(id: string): Promise<ProjectData | null> {
    const record = await prisma.project.findUnique({ where: { id } });
    return record ? toProjectData(record) : null;
  }

  async findMany(
    filters: ProjectFilters,
    pagination: PaginationParams
  ): Promise<{ data: ProjectData[]; meta: PaginationMeta }> {
    const where = buildWhere(filters);
    const skip = (pagination.page - 1) * pagination.pageSize;

    const [records, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    return { data: records.map(toProjectData), meta: buildMeta(total, pagination) };
  }

  async findAllActive(): Promise<ProjectData[]> {
    const records = await prisma.project.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    });
    return records.map(toProjectData);
  }

  async create(input: CreateProjectInput): Promise<ProjectData> {
    const record = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        neighborhoodId: input.neighborhoodId,
        address: input.address ?? null,
        status: input.status ?? "DRAFT",
        coverImage: input.coverImage ?? null,
      },
    });
    return toProjectData(record);
  }

  async update(id: string, input: UpdateProjectInput): Promise<ProjectData> {
    const record = await prisma.project.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.neighborhoodId !== undefined && {
          neighborhoodId: input.neighborhoodId,
        }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
      },
    });
    return toProjectData(record);
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }

  async count(filters: ProjectFilters): Promise<number> {
    return prisma.project.count({ where: buildWhere(filters) });
  }
}
