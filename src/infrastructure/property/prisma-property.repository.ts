import "server-only";
import type {
  Property as PrismaProperty,
  PropertyImage as PrismaPropertyImage,
  PropertyVideo as PrismaPropertyVideo,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { PropertyRepository } from "@/domain/property/property.repository";
import type {
  CreatePropertyInput,
  PropertyData,
  PropertyFilters,
  PropertyImageData,
  PropertyVideoData,
  UpdatePropertyInput,
} from "@/domain/property/property.types";
import type { PaginationMeta, PaginationParams } from "@/types";

// ---------------------------------------------------------------------------
// Mappers — Prisma Decimal fields are converted to string in domain types
// ---------------------------------------------------------------------------

function toPropertyData(record: PrismaProperty): PropertyData {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    dealType: record.dealType as PropertyData["dealType"],
    propertyType: record.propertyType as PropertyData["propertyType"],
    price: record.price.toString(),
    neighborhoodId: record.neighborhoodId,
    address: record.address,
    rooms: record.rooms !== null ? record.rooms.toString() : null,
    area: record.area !== null ? record.area.toString() : null,
    floor: record.floor,
    totalFloors: record.totalFloors,
    status: record.status as PropertyData["status"],
    parking: record.parking,
    elevator: record.elevator,
    balcony: record.balcony,
    safeRoom: record.safeRoom,
    storage: record.storage,
    airConditioning: record.airConditioning,
    accessible: record.accessible,
    furnished: record.furnished,
    agentId: record.agentId,
    projectId: record.projectId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toImageData(record: PrismaPropertyImage): PropertyImageData {
  return {
    id: record.id,
    propertyId: record.propertyId,
    url: record.url,
    alt: record.alt,
    sortOrder: record.sortOrder,
    isMain: record.isMain,
    createdAt: record.createdAt,
  };
}

function toVideoData(record: PrismaPropertyVideo): PropertyVideoData {
  return {
    id: record.id,
    propertyId: record.propertyId,
    url: record.url,
    thumbnailUrl: record.thumbnailUrl,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt,
  };
}

function buildWhere(filters: PropertyFilters) {
  return {
    ...(filters.status !== undefined && { status: filters.status }),
    ...(filters.dealType !== undefined && { dealType: filters.dealType }),
    ...(filters.propertyType !== undefined && {
      propertyType: filters.propertyType,
    }),
    ...(filters.neighborhoodId !== undefined && {
      neighborhoodId: filters.neighborhoodId,
    }),
    ...(filters.agentId !== undefined && { agentId: filters.agentId }),
    ...(filters.projectId !== undefined && { projectId: filters.projectId }),
    ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      price: {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      },
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

export class PrismaPropertyRepository implements PropertyRepository {
  async findById(id: string): Promise<PropertyData | null> {
    const record = await prisma.property.findUnique({ where: { id } });
    return record ? toPropertyData(record) : null;
  }

  async findByIdWithMedia(id: string): Promise<
    | (PropertyData & {
        images: PropertyImageData[];
        videos: PropertyVideoData[];
      })
    | null
  > {
    const record = await prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        videos: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!record) return null;

    return {
      ...toPropertyData(record),
      images: record.images.map(toImageData),
      videos: record.videos.map(toVideoData),
    };
  }

  async findMany(
    filters: PropertyFilters,
    pagination: PaginationParams
  ): Promise<{ data: PropertyData[]; meta: PaginationMeta }> {
    const where = buildWhere(filters);
    const skip = (pagination.page - 1) * pagination.pageSize;

    const [records, total] = await prisma.$transaction([
      prisma.property.findMany({
        where,
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.property.count({ where }),
    ]);

    return { data: records.map(toPropertyData), meta: buildMeta(total, pagination) };
  }

  async create(input: CreatePropertyInput): Promise<PropertyData> {
    const record = await prisma.property.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        dealType: input.dealType,
        propertyType: input.propertyType,
        price: input.price,
        neighborhoodId: input.neighborhoodId,
        address: input.address ?? null,
        rooms: input.rooms ?? null,
        area: input.area ?? null,
        floor: input.floor ?? null,
        totalFloors: input.totalFloors ?? null,
        status: input.status ?? "DRAFT",
        parking: input.parking ?? false,
        elevator: input.elevator ?? false,
        balcony: input.balcony ?? false,
        safeRoom: input.safeRoom ?? false,
        storage: input.storage ?? false,
        airConditioning: input.airConditioning ?? false,
        accessible: input.accessible ?? false,
        furnished: input.furnished ?? false,
        agentId: input.agentId,
        projectId: input.projectId ?? null,
      },
    });
    return toPropertyData(record);
  }

  async update(id: string, input: UpdatePropertyInput): Promise<PropertyData> {
    const record = await prisma.property.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.dealType !== undefined && { dealType: input.dealType }),
        ...(input.propertyType !== undefined && { propertyType: input.propertyType }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.neighborhoodId !== undefined && {
          neighborhoodId: input.neighborhoodId,
        }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.rooms !== undefined && { rooms: input.rooms }),
        ...(input.area !== undefined && { area: input.area }),
        ...(input.floor !== undefined && { floor: input.floor }),
        ...(input.totalFloors !== undefined && { totalFloors: input.totalFloors }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.parking !== undefined && { parking: input.parking }),
        ...(input.elevator !== undefined && { elevator: input.elevator }),
        ...(input.balcony !== undefined && { balcony: input.balcony }),
        ...(input.safeRoom !== undefined && { safeRoom: input.safeRoom }),
        ...(input.storage !== undefined && { storage: input.storage }),
        ...(input.airConditioning !== undefined && {
          airConditioning: input.airConditioning,
        }),
        ...(input.accessible !== undefined && { accessible: input.accessible }),
        ...(input.furnished !== undefined && { furnished: input.furnished }),
        ...(input.agentId !== undefined && { agentId: input.agentId }),
        ...(input.projectId !== undefined && { projectId: input.projectId }),
      },
    });
    return toPropertyData(record);
  }

  async archive(id: string): Promise<PropertyData> {
    const record = await prisma.property.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    return toPropertyData(record);
  }

  async delete(id: string): Promise<void> {
    // Images and videos cascade-delete via the DB foreign key constraint.
    await prisma.property.delete({ where: { id } });
  }

  async count(filters: PropertyFilters): Promise<number> {
    return prisma.property.count({ where: buildWhere(filters) });
  }

  // ---------------------------------------------------------------------------
  // Image helpers
  // ---------------------------------------------------------------------------

  async findImages(propertyId: string): Promise<PropertyImageData[]> {
    const records = await prisma.propertyImage.findMany({
      where: { propertyId },
      orderBy: { sortOrder: "asc" },
    });
    return records.map(toImageData);
  }

  async addImage(
    propertyId: string,
    data: Omit<PropertyImageData, "id" | "propertyId" | "createdAt">
  ): Promise<PropertyImageData> {
    const record = await prisma.propertyImage.create({
      data: {
        propertyId,
        url: data.url,
        alt: data.alt ?? null,
        sortOrder: data.sortOrder ?? 0,
        isMain: data.isMain ?? false,
      },
    });
    return toImageData(record);
  }

  async deleteImage(imageId: string): Promise<void> {
    await prisma.propertyImage.delete({ where: { id: imageId } });
  }

  async reorderImages(
    propertyId: string,
    orderedImageIds: string[]
  ): Promise<void> {
    // Execute all updates inside a transaction so partial failures roll back.
    await prisma.$transaction(
      orderedImageIds.map((imageId, index) =>
        prisma.propertyImage.update({
          where: { id: imageId },
          data: { sortOrder: index },
        })
      )
    );
  }

  // ---------------------------------------------------------------------------
  // Video helpers
  // ---------------------------------------------------------------------------

  async addVideo(
    propertyId: string,
    data: Omit<PropertyVideoData, "id" | "propertyId" | "createdAt">
  ): Promise<PropertyVideoData> {
    const record = await prisma.propertyVideo.create({
      data: {
        propertyId,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return toVideoData(record);
  }

  async deleteVideo(videoId: string): Promise<void> {
    await prisma.propertyVideo.delete({ where: { id: videoId } });
  }
}
