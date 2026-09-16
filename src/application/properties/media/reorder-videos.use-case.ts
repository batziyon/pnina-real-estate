/**
 * Reorder Videos Use Case
 *
 * Reorders all videos for a property by setting their sortOrder.
 *
 * Flow:
 * 1. Verify property exists and actor is authorized
 * 2. Validate input: complete list, no duplicates, all belong to property
 * 3. Update sortOrder for all videos in transaction
 * 4. Return updated video list
 *
 * Validation:
 * - Array must be non-empty
 * - No duplicate IDs
 * - All IDs must belong to this property
 * - List must represent complete set of property videos
 *
 * sortOrder Assignment:
 * - First ID → sortOrder = 0
 * - Second ID → sortOrder = 1
 * - Nth ID → sortOrder = N-1
 */

import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyVideoData } from "@/domain/property/property.types";
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

export interface ReorderVideosInput {
  videoIds: string[];
}

export class ReorderVideosUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository
  ) {}

  async execute(
    propertyId: string,
    input: ReorderVideosInput,
    actor: Actor
  ): Promise<PropertyVideoData[]> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new EntityNotFoundError("Property", propertyId);
    }

    // 2. Verify actor is authorized
    if (!canActorEditProperty(actor.id, actor.role, property)) {
      throw new UnauthorizedError(
        "You are not authorized to manage videos for this property."
      );
    }

    // 3. Validate input
    if (!input.videoIds || input.videoIds.length === 0) {
      throw new ValidationError(
        "Video IDs array must not be empty.",
        { videoIds: "Array must contain at least one video ID" }
      );
    }

    // 4. Check for duplicate IDs
    const uniqueIds = new Set(input.videoIds);
    if (uniqueIds.size !== input.videoIds.length) {
      throw new ValidationError(
        "Video IDs array contains duplicates.",
        { videoIds: "Duplicate video IDs are not allowed" }
      );
    }

    // 5. Load all property videos
    const existingVideos = await this.propertyRepository.findVideos(propertyId);

    // 6. Verify all submitted IDs belong to this property
    const existingIds = new Set(existingVideos.map(vid => vid.id));
    for (const id of input.videoIds) {
      if (!existingIds.has(id)) {
        throw new ValidationError(
          `Video ID ${id} does not belong to this property.`,
          { videoIds: "All video IDs must belong to the property" }
        );
      }
    }

    // 7. Verify list is complete (no missing videos)
    if (input.videoIds.length !== existingVideos.length) {
      throw new ValidationError(
        "Incomplete video list. All property videos must be included in reorder.",
        {
          videoIds: `Expected ${existingVideos.length} videos, got ${input.videoIds.length}`
        }
      );
    }

    // 8. Reorder videos in transaction
    await this.propertyRepository.reorderVideos(propertyId, input.videoIds);

    // 9. Return updated videos
    return await this.propertyRepository.findVideos(propertyId);
  }
}
