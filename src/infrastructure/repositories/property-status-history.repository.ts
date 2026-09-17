/**
 * Prisma implementation of PropertyStatusHistoryRepository.
 *
 * This is the infrastructure layer — Prisma imports are allowed here.
 */

import { prisma } from "@/lib/prisma";
import type {
  PropertyStatusHistoryRepository,
} from "@/domain/property-status-history/property-status-history.repository";
import type {
  PropertyStatusHistoryData,
  CreateStatusHistoryInput,
} from "@/domain/property-status-history/property-status-history.types";
import { PropertyStatusChangeReason, PropertyStatus } from "@/generated/prisma/client";

export class PrismaPropertyStatusHistoryRepository
  implements PropertyStatusHistoryRepository
{
  async create(input: CreateStatusHistoryInput): Promise<PropertyStatusHistoryData> {
    const record = await prisma.propertyStatusHistory.create({
      data: {
        propertyId: input.propertyId,
        fromStatus: input.fromStatus as PropertyStatus | null,
        toStatus: input.toStatus as PropertyStatus,
        reason: input.reason as PropertyStatusChangeReason,
        notes: input.notes ?? null,
        changedBy: input.changedBy,
      },
    });

    return {
      id: record.id,
      propertyId: record.propertyId,
      fromStatus: record.fromStatus,
      toStatus: record.toStatus,
      reason: record.reason,
      notes: record.notes,
      changedBy: record.changedBy,
      createdAt: record.createdAt,
    };
  }

  async findByPropertyId(propertyId: string): Promise<PropertyStatusHistoryData[]> {
    const records = await prisma.propertyStatusHistory.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => ({
      id: record.id,
      propertyId: record.propertyId,
      fromStatus: record.fromStatus,
      toStatus: record.toStatus,
      reason: record.reason,
      notes: record.notes,
      changedBy: record.changedBy,
      createdAt: record.createdAt,
    }));
  }
}
