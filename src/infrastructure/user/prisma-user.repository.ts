import "server-only";
import type { User as PrismaUser } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { UserRepository } from "@/domain/user/user.repository";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserData,
  UserFilters,
  UserWithCredentials,
} from "@/domain/user/user.types";
import type { PaginationMeta, PaginationParams } from "@/types";

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

/** Safe mapping — passwordHash is intentionally excluded. */
function toUserData(record: PrismaUser): UserData {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    role: record.role as UserData["role"],
    active: record.active,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

/** Full mapping including credentials — only used by auth use cases. */
function toUserWithCredentials(record: PrismaUser): UserWithCredentials {
  return {
    ...toUserData(record),
    passwordHash: record.passwordHash,
  };
}

function buildWhere(filters: UserFilters) {
  return {
    ...(filters.role !== undefined && { role: filters.role }),
    ...(filters.active !== undefined && { active: filters.active }),
  };
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

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<UserData | null> {
    const record = await prisma.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
    });
    return record ? (record as unknown as PrismaUser & { passwordHash: null })
      ? toUserData({ ...record, passwordHash: null } as PrismaUser)
      : null : null;
  }

  async findByIdWithCredentials(id: string): Promise<UserWithCredentials | null> {
    const record = await prisma.user.findUnique({ where: { id } });
    return record ? toUserWithCredentials(record) : null;
  }

  async findByEmail(email: string): Promise<UserData | null> {
    const record = await prisma.user.findUnique({ where: { email } });
    return record ? toUserData(record) : null;
  }

  async findByEmailWithCredentials(
    email: string
  ): Promise<UserWithCredentials | null> {
    const record = await prisma.user.findUnique({ where: { email } });
    return record ? toUserWithCredentials(record) : null;
  }

  async findMany(
    filters: UserFilters,
    pagination: PaginationParams
  ): Promise<{ data: UserData[]; meta: PaginationMeta }> {
    const where = buildWhere(filters);
    const skip = (pagination.page - 1) * pagination.pageSize;

    const [records, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: records.map(toUserData),
      meta: buildMeta(total, pagination),
    };
  }

  async findAllActiveAgents(): Promise<UserData[]> {
    const records = await prisma.user.findMany({
      where: { role: "AGENT", active: true },
      orderBy: { name: "asc" },
    });
    return records.map(toUserData);
  }

  async create(input: CreateUserInput): Promise<UserData> {
    const record = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        role: input.role ?? "AGENT",
        passwordHash: input.passwordHash ?? null,
        active: true,
      },
    });
    return toUserData(record);
  }

  async update(id: string, input: UpdateUserInput): Promise<UserData> {
    const record = await prisma.user.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.role !== undefined && { role: input.role }),
        ...(input.active !== undefined && { active: input.active }),
      },
    });
    return toUserData(record);
  }

  async deactivate(id: string): Promise<UserData> {
    const record = await prisma.user.update({
      where: { id },
      data: { active: false },
    });
    return toUserData(record);
  }

  async count(filters: UserFilters): Promise<number> {
    return prisma.user.count({ where: buildWhere(filters) });
  }
}
