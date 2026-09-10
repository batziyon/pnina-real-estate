import "server-only";
import type { Neighborhood as PrismaNeighborhood } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type {
  CreateNeighborhoodInput,
  NeighborhoodData,
  UpdateNeighborhoodInput,
} from "@/domain/neighborhood/neighborhood.types";

// ---------------------------------------------------------------------------
// Mapper — Prisma record → domain type
// ---------------------------------------------------------------------------

function toNeighborhoodData(record: PrismaNeighborhood): NeighborhoodData {
  return {
    id: record.id,
    name: record.name,
    active: record.active,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class PrismaNeighborhoodRepository implements NeighborhoodRepository {
  async findById(id: string): Promise<NeighborhoodData | null> {
    const record = await prisma.neighborhood.findUnique({ where: { id } });
    return record ? toNeighborhoodData(record) : null;
  }

  async findByName(name: string): Promise<NeighborhoodData | null> {
    const record = await prisma.neighborhood.findUnique({ where: { name } });
    return record ? toNeighborhoodData(record) : null;
  }

  async findAll(): Promise<NeighborhoodData[]> {
    const records = await prisma.neighborhood.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return records.map(toNeighborhoodData);
  }

  async findAllActive(): Promise<NeighborhoodData[]> {
    const records = await prisma.neighborhood.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return records.map(toNeighborhoodData);
  }

  async create(input: CreateNeighborhoodInput): Promise<NeighborhoodData> {
    const record = await prisma.neighborhood.create({
      data: {
        name: input.name,
        active: input.active ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });
    return toNeighborhoodData(record);
  }

  async update(
    id: string,
    input: UpdateNeighborhoodInput
  ): Promise<NeighborhoodData> {
    const record = await prisma.neighborhood.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.active !== undefined && { active: input.active }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
    });
    return toNeighborhoodData(record);
  }

  async deactivate(id: string): Promise<NeighborhoodData> {
    const record = await prisma.neighborhood.update({
      where: { id },
      data: { active: false },
    });
    return toNeighborhoodData(record);
  }
}
