/**
 * Reorder Images Use Case
 *
 * Reorders all images for a property by setting their sortOrder.
 *
 * Flow:
 * 1. Verify property exists and actor is authorized
 * 2. Validate input: complete list, no duplicates, all belong to property
 * 3. Update sortOrder for all images in transaction
 * 4. Return updated image list
 *
 * Validation:
 * - Array must be non-empty
 * - No duplicate IDs
 * - All IDs must belong to this property
 * - List must represent complete set of property images
 *
 * sortOrder Assignment:
 * - First ID → sortOrder = 0
 * - Second ID → sortOrder = 1
 * - Nth ID → sortOrder = N-1
 *
 * isMain:
 * - Not changed by reorder operation
 */

import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyImageData } from "@/domain/property/property.types";
import type { UserRole } from "@/domain/user/user.types";
import { canActorEditProperty } from "@/domain/property/property.rules";
import {
  EntityNotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export interface ReorderImagesInput {
  imageIds: string[];
}

export class ReorderImagesUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository
  ) {}

  async execute(
    propertyId: string,
    input: ReorderImagesInput,
    actor: Actor
  ): Promise<PropertyImageData[]> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new EntityNotFoundError("Property", propertyId);
    }

    // 2. Verify actor is authorized
    if (!canActorEditProperty(actor.id, actor.role, property)) {
      throw new UnauthorizedError(
        "You are not authorized to manage images for this property."
      );
    }

    // 3. Validate input
    if (!input.imageIds || input.imageIds.length === 0) {
      throw new ValidationError(
        "Image IDs array must not be empty.",
        { imageIds: "Array must contain at least one image ID" }
      );
    }

    // 4. Check for duplicate IDs
    const uniqueIds = new Set(input.imageIds);
    if (uniqueIds.size !== input.imageIds.length) {
      throw new ValidationError(
        "Image IDs array contains duplicates.",
        { imageIds: "Duplicate image IDs are not allowed" }
      );
    }

    // 5. Load all property images
    const existingImages = await this.propertyRepository.findImages(propertyId);

    // 6. Verify all submitted IDs belong to this property
    const existingIds = new Set(existingImages.map(img => img.id));
    for (const id of input.imageIds) {
      if (!existingIds.has(id)) {
        throw new ValidationError(
          `Image ID ${id} does not belong to this property.`,
          { imageIds: "All image IDs must belong to the property" }
        );
      }
    }

    // 7. Verify list is complete (no missing images)
    if (input.imageIds.length !== existingImages.length) {
      throw new ValidationError(
        "Incomplete image list. All property images must be included in reorder.",
        {
          imageIds: `Expected ${existingImages.length} images, got ${input.imageIds.length}`
        }
      );
    }

    // 8. Reorder images in transaction
    await this.propertyRepository.reorderImages(propertyId, input.imageIds);

    // 9. Return updated images
    return await this.propertyRepository.findImages(propertyId);
  }
}
