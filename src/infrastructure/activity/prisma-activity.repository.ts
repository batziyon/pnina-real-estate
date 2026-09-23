/**
 * Prisma Activity Repository
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { ActivityRepository } from "@/domain/activity/activity.repository";
import type {
  Activity,
  ActivityWithRecorder,
  CreateActivityData,
  UpdateActivityData,
  ActivityFilters,
} from "@/domain/activity/activity.types";

export class PrismaActivityRepository implements ActivityRepository {
  async create(data: CreateActivityData): Promise<Activity> {
    return prisma.activity.create({
      data: {
        contactId: data.contactId,
        activityType: data.activityType,
        title: data.title,
        description: data.description ?? null,
        activityDate: data.activityDate,
        recordedById: data.recordedById,
      },
    });
  }

  async findById(id: string): Promise<ActivityWithRecorder | null> {
    return prisma.activity.findUnique({
      where: { id },
      include: {
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByContact(
    contactId: string,
    limit = 50
  ): Promise<ActivityWithRecorder[]> {
    return prisma.activity.findMany({
      where: { contactId },
      include: {
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        activityDate: "desc",
      },
      take: limit,
    });
  }

  async list(filters: ActivityFilters): Promise<ActivityWithRecorder[]> {
    const where: Record<string, unknown> = {};

    if (filters.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters.activityType) {
      where.activityType = filters.activityType;
    }

    if (filters.fromDate || filters.toDate) {
      where.activityDate = {};
      if (filters.fromDate) {
        (where.activityDate as Record<string, unknown>).gte = filters.fromDate;
      }
      if (filters.toDate) {
        (where.activityDate as Record<string, unknown>).lte = filters.toDate;
      }
    }

    return prisma.activity.findMany({
      where,
      include: {
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        activityDate: "desc",
      },
    });
  }

  async update(id: string, data: UpdateActivityData): Promise<Activity> {
    return prisma.activity.update({
      where: { id },
      data: {
        activityType: data.activityType,
        title: data.title,
        description: data.description,
        activityDate: data.activityDate,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.activity.delete({
      where: { id },
    });
  }
}
