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

  /** Find a single image by its ID. Returns null if not found. */
  findImageById(imageId: string): Promise<PropertyImageData | null>;

  /** Add an image record to a property. ID must be provided from upload intent. */
  addImage(
    propertyId: string,
    data: Omit<PropertyImageData, "propertyId" | "createdAt">
  ): Promise<PropertyImageData>;

  /** Update an existing image record. */
  updateImage(
    imageId: string,
    data: Partial<Pick<PropertyImageData, "isMain" | "sortOrder" | "alt">>
  ): Promise<PropertyImageData>;

  /** Set an image as main (unsets other mains in same property). */
  setImageAsMain(propertyId: string, imageId: string): Promise<PropertyImageData>;

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
