/**
 * Repository interface for the Property aggregate.
 *
 * Defines the persistence contract that the application layer depends on.
 * Infrastructure (Prisma) implements this interface — the domain and
 * application layers never import from @prisma/client directly.
 */

import type { PaginationMeta, PaginationParams } from "@/types";
import type {
  CreatePropertyInput,
  PropertyData,
  PropertyFilters,
  UpdatePropertyInput,
  PropertyImageData,
  PropertyVideoData,
} from "./property.types";

export interface PropertyRepository {
  /** Find a single property by its ID. Returns null if not found. */
  findById(id: string): Promise<PropertyData | null>;

  /** Find a single property with its images and videos included. */
  findByIdWithMedia(
    id: string
  ): Promise<(PropertyData & { images: PropertyImageData[]; videos: PropertyVideoData[] }) | null>;

  /** List properties with optional filters and pagination. */
  findMany(
    filters: PropertyFilters,
    pagination: PaginationParams
  ): Promise<{ data: PropertyData[]; meta: PaginationMeta }>;

  /** Create a new property record. Returns the created property. */
  create(input: CreatePropertyInput): Promise<PropertyData>;

  /** Update an existing property. Returns the updated property. */
  update(id: string, input: UpdatePropertyInput): Promise<PropertyData>;

  /** Soft-archive a property (sets status to ARCHIVED). */
  archive(id: string): Promise<PropertyData>;

  /** Hard-delete a property and cascade to images/videos. */
  delete(id: string): Promise<void>;

  /** Count properties matching the given filters. */
  count(filters: PropertyFilters): Promise<number>;

  // ---------------------------------------------------------------------------
  // Image helpers
  // ---------------------------------------------------------------------------

  /** Return all images for a property ordered by sortOrder. */
  findImages(propertyId: string): Promise<PropertyImageData[]>;

  /** Add an image record to a property. */
  addImage(
    propertyId: string,
    data: Omit<PropertyImageData, "id" | "propertyId" | "createdAt">
  ): Promise<PropertyImageData>;

  /** Delete a single image record. */
  deleteImage(imageId: string): Promise<void>;

  /** Reorder images by providing an ordered list of image IDs. */
  reorderImages(propertyId: string, orderedImageIds: string[]): Promise<void>;

  // ---------------------------------------------------------------------------
  // Video helpers
  // ---------------------------------------------------------------------------

  /** Add a video record to a property. */
  addVideo(
    propertyId: string,
    data: Omit<PropertyVideoData, "id" | "propertyId" | "createdAt">
  ): Promise<PropertyVideoData>;

  /** Delete a single video record. */
  deleteVideo(videoId: string): Promise<void>;
}
