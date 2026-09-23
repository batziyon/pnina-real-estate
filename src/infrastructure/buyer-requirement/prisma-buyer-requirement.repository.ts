/**
 * Prisma BuyerRequirement Repository — Infrastructure Layer
 *
 * Server-only implementation.
 */

import "server-only";

import type {
  BuyerRequirement as PrismaBuyerRequirement,
  BuyerRequirementNeighborhood as PrismaBuyerRequirementNeighborhood,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  BuyerRequirementData,
  CreateBuyerRequirementInput,
  UpdateBuyerRequirementInput,
  BuyerRequirementFilters,
  NeighborhoodPreference,
} from "@/domain/buyer-requirement/buyer-requirement.types";
import type { BuyerRequirementRepository } from "@/domain/buyer-requirement/buyer-requirement.repository";
import type { PaginationParams, PaginationMeta } from "@/types";

export class PrismaBuyerRequirementRepository
  implements BuyerRequirementRepository
{
  /**
   * Map Prisma record to domain type.
   */
  private toDomain(
    record: PrismaBuyerRequirement & {
      preferredNeighborhoods: Array<
        PrismaBuyerRequirementNeighborhood & {
          neighborhood: { name: string };
        }
      >;
    }
  ): BuyerRequirementData {
    return {
      id: record.id,
      contactId: record.contactId,
      dealType: record.dealType as "SALE" | "RENT",
      propertyType: record.propertyType as BuyerRequirementData["propertyType"],
      minRooms: record.minRooms ? Number(record.minRooms) : null,
      maxRooms: record.maxRooms ? Number(record.maxRooms) : null,
      minArea: record.minArea ? Number(record.minArea) : null,
      maxArea: record.maxArea ? Number(record.maxArea) : null,
      minPrice: record.minPrice ? Number(record.minPrice) : null,
      maxPrice: record.maxPrice ? Number(record.maxPrice) : null,
      
      // Enhanced fields (PHASE 2)
      minFloor: record.minFloor ? Number(record.minFloor) : null,
      maxFloor: record.maxFloor ? Number(record.maxFloor) : null,
      requiresElevator: record.requiresElevator ?? false,
      requiresParking: record.requiresParking ?? false,
      requiresBalcony: record.requiresBalcony ?? false,
      requiresSafeRoom: record.requiresSafeRoom ?? false,
      accessibilityRequired: record.accessibilityRequired ?? false,
      renovationPreference: record.renovationPreference,
      newConstructionPreference: record.newConstructionPreference,
      moveInTimeframe: record.moveInTimeframe,
      
      notes: record.notes,
      active: record.active,
      neighborhoods: record.preferredNeighborhoods.map(
        (pn: {
          neighborhoodId: string;
          preferenceType: string;
          neighborhood: { name: string };
        }): NeighborhoodPreference => ({
          neighborhoodId: pn.neighborhoodId,
          preferenceType: pn.preferenceType as "REQUIRED" | "PREFERRED",
          neighborhoodName: pn.neighborhood.name,
        })
      ),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async findById(id: string): Promise<BuyerRequirementData | null> {
    const record = await prisma.buyerRequirement.findUnique({
      where: { id },
      include: {
        preferredNeighborhoods: {
          include: { neighborhood: true },
          orderBy: { preferenceType: "asc" }, // REQUIRED first
        },
      },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByContactId(contactId: string): Promise<BuyerRequirementData[]> {
    const records = await prisma.buyerRequirement.findMany({
      where: { contactId },
      include: {
        preferredNeighborhoods: {
          include: { neighborhood: true },
          orderBy: { preferenceType: "asc" },
        },
      },
      orderBy: [{ active: "desc" }, { createdAt: "desc" }], // Active first, then newest
    });

    return records.map((r) => this.toDomain(r));
  }

  async findMany(
    filters: BuyerRequirementFilters,
    options: PaginationParams
  ): Promise<{ data: BuyerRequirementData[]; meta: PaginationMeta }> {
    const where: Record<string, unknown> = {};

    if (filters.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.dealType) {
      where.dealType = filters.dealType;
    }

    const [total, records] = await Promise.all([
      prisma.buyerRequirement.count({ where }),
      prisma.buyerRequirement.findMany({
        where,
        include: {
          preferredNeighborhoods: {
            include: { neighborhood: true },
            orderBy: { preferenceType: "asc" },
          },
        },
        orderBy: [{ active: "desc" }, { createdAt: "desc" }],
        skip: (options.page - 1) * options.pageSize,
        take: options.pageSize,
      }),
    ]);

    return {
      data: records.map((r) => this.toDomain(r)),
      meta: {
        total,
        page: options.page,
        pageSize: options.pageSize,
        totalPages: Math.ceil(total / options.pageSize),
      },
    };
  }

  async create(
    input: CreateBuyerRequirementInput
  ): Promise<BuyerRequirementData> {
    const record = await prisma.buyerRequirement.create({
      data: {
        contactId: input.contactId,
        dealType: input.dealType,
        propertyType: input.propertyType || null,
        minRooms: input.minRooms !== undefined ? input.minRooms : null,
        maxRooms: input.maxRooms !== undefined ? input.maxRooms : null,
        minArea: input.minArea !== undefined ? input.minArea : null,
        maxArea: input.maxArea !== undefined ? input.maxArea : null,
        minPrice: input.minPrice !== undefined ? input.minPrice : null,
        maxPrice: input.maxPrice !== undefined ? input.maxPrice : null,
        
        // Enhanced fields (PHASE 2)
        minFloor: input.minFloor !== undefined ? input.minFloor : null,
        maxFloor: input.maxFloor !== undefined ? input.maxFloor : null,
        requiresElevator: input.requiresElevator ?? false,
        requiresParking: input.requiresParking ?? false,
        requiresBalcony: input.requiresBalcony ?? false,
        requiresSafeRoom: input.requiresSafeRoom ?? false,
        accessibilityRequired: input.accessibilityRequired ?? false,
        renovationPreference: input.renovationPreference || null,
        newConstructionPreference: input.newConstructionPreference !== undefined ? input.newConstructionPreference : null,
        moveInTimeframe: input.moveInTimeframe || null,
        
        notes: input.notes || null,
        active: true,
        preferredNeighborhoods: {
          create: input.neighborhoods.map((n) => ({
            neighborhoodId: n.neighborhoodId,
            preferenceType: n.preferenceType,
          })),
        },
      },
      include: {
        preferredNeighborhoods: {
          include: { neighborhood: true },
          orderBy: { preferenceType: "asc" },
        },
      },
    });

    return this.toDomain(record);
  }

  async update(
    id: string,
    input: UpdateBuyerRequirementInput
  ): Promise<BuyerRequirementData> {
    // If neighborhoods are being updated, delete old ones and create new ones
    if (input.neighborhoods !== undefined) {
      await prisma.buyerRequirementNeighborhood.deleteMany({
        where: { buyerRequirementId: id },
      });
    }

    const record = await prisma.buyerRequirement.update({
      where: { id },
      data: {
        ...(input.dealType !== undefined && { dealType: input.dealType }),
        ...(input.propertyType !== undefined && {
          propertyType: input.propertyType,
        }),
        ...(input.minRooms !== undefined && { minRooms: input.minRooms }),
        ...(input.maxRooms !== undefined && { maxRooms: input.maxRooms }),
        ...(input.minArea !== undefined && { minArea: input.minArea }),
        ...(input.maxArea !== undefined && { maxArea: input.maxArea }),
        ...(input.minPrice !== undefined && { minPrice: input.minPrice }),
        ...(input.maxPrice !== undefined && { maxPrice: input.maxPrice }),
        
        // Enhanced fields (PHASE 2)
        ...(input.minFloor !== undefined && { minFloor: input.minFloor }),
        ...(input.maxFloor !== undefined && { maxFloor: input.maxFloor }),
        ...(input.requiresElevator !== undefined && { requiresElevator: input.requiresElevator }),
        ...(input.requiresParking !== undefined && { requiresParking: input.requiresParking }),
        ...(input.requiresBalcony !== undefined && { requiresBalcony: input.requiresBalcony }),
        ...(input.requiresSafeRoom !== undefined && { requiresSafeRoom: input.requiresSafeRoom }),
        ...(input.accessibilityRequired !== undefined && { accessibilityRequired: input.accessibilityRequired }),
        ...(input.renovationPreference !== undefined && { renovationPreference: input.renovationPreference }),
        ...(input.newConstructionPreference !== undefined && { newConstructionPreference: input.newConstructionPreference }),
        ...(input.moveInTimeframe !== undefined && { moveInTimeframe: input.moveInTimeframe }),
        
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.active !== undefined && { active: input.active }),
        ...(input.neighborhoods !== undefined && {
          preferredNeighborhoods: {
            create: input.neighborhoods.map((n) => ({
              neighborhoodId: n.neighborhoodId,
              preferenceType: n.preferenceType,
            })),
          },
        }),
      },
      include: {
        preferredNeighborhoods: {
          include: { neighborhood: true },
          orderBy: { preferenceType: "asc" },
        },
      },
    });

    return this.toDomain(record);
  }

  async deactivate(id: string): Promise<BuyerRequirementData> {
    const record = await prisma.buyerRequirement.update({
      where: { id },
      data: { active: false },
      include: {
        preferredNeighborhoods: {
          include: { neighborhood: true },
          orderBy: { preferenceType: "asc" },
        },
      },
    });

    return this.toDomain(record);
  }

  async count(filters: BuyerRequirementFilters): Promise<number> {
    const where: Record<string, unknown> = {};

    if (filters.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.dealType) {
      where.dealType = filters.dealType;
    }

    return prisma.buyerRequirement.count({ where });
  }
}
