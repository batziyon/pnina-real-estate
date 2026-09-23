/**
 * Prisma PropertyInterest Repository — Infrastructure Layer
 *
 * Server-only implementation.
 */

import "server-only";

import type { PropertyInterest as PrismaPropertyInterest } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  PropertyInterestData,
  CreatePropertyInterestInput,
  UpdatePropertyInterestInput,
  PropertyInterestStatus,
} from "@/domain/property-interest/property-interest.types";
import type { PropertyInterestRepository } from "@/domain/property-interest/property-interest.repository";

export class PrismaPropertyInterestRepository implements PropertyInterestRepository {
  /**
   * Map Prisma record to domain type.
   */
  private toDomain(record: PrismaPropertyInterest): PropertyInterestData {
    return {
      id: record.id,
      contactId: record.contactId,
      propertyId: record.propertyId,
      status: record.status as PropertyInterestStatus,
      source: record.source as PropertyInterestData["source"],
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async findById(id: string): Promise<PropertyInterestData | null> {
    const record = await prisma.propertyInterest.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByContactAndProperty(
    contactId: string,
    propertyId: string
  ): Promise<PropertyInterestData | null> {
    const record = await prisma.propertyInterest.findUnique({
      where: {
        contactId_propertyId: {
          contactId,
          propertyId,
        },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByContactId(contactId: string): Promise<PropertyInterestData[]> {
    const records = await prisma.propertyInterest.findMany({
      where: { contactId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findByPropertyId(
    propertyId: string,
    statusFilter?: PropertyInterestStatus
  ): Promise<PropertyInterestData[]> {
    const records = await prisma.propertyInterest.findMany({
      where: {
        propertyId,
        ...(statusFilter && { status: statusFilter }),
      },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r) => this.toDomain(r));
  }

  async create(input: CreatePropertyInterestInput): Promise<PropertyInterestData> {
    const record = await prisma.propertyInterest.create({
      data: {
        contactId: input.contactId,
        propertyId: input.propertyId,
        source: input.source,
        status: input.status ?? "INTERESTED",
        notes: input.notes ?? null,
      },
    });
    return this.toDomain(record);
  }

  async update(
    id: string,
    input: UpdatePropertyInterestInput
  ): Promise<PropertyInterestData> {
    const record = await prisma.propertyInterest.update({
      where: { id },
      data: {
        ...(input.status !== undefined && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await prisma.propertyInterest.delete({ where: { id } });
  }

  async countByProperty(
    propertyId: string,
    statusFilter?: PropertyInterestStatus
  ): Promise<number> {
    return prisma.propertyInterest.count({
      where: {
        propertyId,
        ...(statusFilter && { status: statusFilter }),
      },
    });
  }

  async count(filters?: { contactId?: string; propertyId?: string; status?: PropertyInterestStatus }): Promise<number> {
    const where: Record<string, unknown> = {};
    
    if (filters?.contactId) {
      where.contactId = filters.contactId;
    }
    
    if (filters?.propertyId) {
      where.propertyId = filters.propertyId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    return prisma.propertyInterest.count({ where });
  }
}
