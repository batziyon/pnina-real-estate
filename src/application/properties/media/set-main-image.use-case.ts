/**
 * Set Main Image Use Case
 *
 * Sets a specific image as the main image for a property.
 * Unsets any other image that was previously main.
 *
 * Flow:
 * 1. Verify property exists and actor is authorized
 * 2. Verify image exists and belongs to property
 * 3. In transaction: unset current main, set new main
 * 4. Return updated image
 *
 * Idempotency:
 * - If image is already main, operation succeeds (no-op)
 *
 * Database Safety:
 * - Transaction ensures atomicity
 * - Partial unique index prevents multiple mains
 */

import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyImageData } from "@/domain/property/property.types";
import type { UserRole } from "@/domain/user/user.types";
import { canActorEditProperty } from "@/domain/property/property.rules";
import {
  EntityNotFoundError,
  UnauthorizedError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class SetMainImageUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository
  ) {}

  async execute(
    propertyId: string,
    imageId: string,
    actor: Actor
  ): Promise<PropertyImageData> {
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

    // 3. Load image and verify it belongs to this property
    const image = await this.propertyRepository.findImageById(imageId);
    if (!image) {
      throw new EntityNotFoundError("Image", imageId);
    }

    if (image.propertyId !== propertyId) {
      // Image exists but belongs to different property - treat as not found
      throw new EntityNotFoundError("Image", imageId);
    }

    // 4. If already main, return success (idempotent)
    if (image.isMain) {
      return image;
    }

    // 5. Set as main (repository handles transaction)
    return await this.propertyRepository.setImageAsMain(propertyId, imageId);
  }
}
