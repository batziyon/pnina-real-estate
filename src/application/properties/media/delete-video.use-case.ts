/**
 * Delete Video Use Case
 *
 * Deletes a property video including both database record and storage object.
 *
 * Flow:
 * 1. Verify property exists and actor is authorized
 * 2. Load video and verify it belongs to the property
 * 3. Delete database record first (preserve referential integrity)
 * 4. Delete storage object (best effort)
 *
 * Deletion Order:
 * - Database record deleted FIRST
 * - Storage object deleted SECOND
 * - This prevents orphaned DB records pointing to deleted blobs
 * - If storage deletion fails, log error but don't roll back DB deletion
 */

import type { PropertyRepository } from "@/domain/property/property.repository";
import type { ObjectStoragePort } from "@/application/ports/storage/object-storage.port";
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

export class DeleteVideoUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly objectStorage: ObjectStoragePort
  ) {}

  async execute(
    propertyId: string,
    videoId: string,
    actor: Actor
  ): Promise<void> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new EntityNotFoundError("Property", propertyId);
    }

    // 2. Verify actor is authorized to edit property
    if (!canActorEditProperty(actor.id, actor.role, property)) {
      throw new UnauthorizedError(
        "You are not authorized to manage videos for this property."
      );
    }

    // 3. Load video and verify it belongs to this property
    const video = await this.propertyRepository.findVideoById(videoId);
    if (!video) {
      throw new EntityNotFoundError("Video", videoId);
    }

    if (video.propertyId !== propertyId) {
      // Video exists but belongs to different property - treat as not found
      throw new EntityNotFoundError("Video", videoId);
    }

    // 4. Delete database record FIRST
    // This ensures we never have a DB record pointing to a deleted blob
    await this.propertyRepository.deleteVideo(videoId);

    // 5. Delete storage object (best effort)
    // If this fails, we log but don't roll back DB deletion
    // Orphaned blobs can be cleaned up by background job (future work)
    if (video.storageKey) {
      try {
        await this.objectStorage.deleteObject(video.storageKey);
      } catch (error) {
        // Log storage deletion failure but don't fail the entire operation
        // The DB record is already deleted, which is the source of truth
        console.error(
          `[DeleteVideoUseCase] Storage deletion failed for key: ${video.storageKey}`,
          error instanceof Error ? error.message : String(error)
        );
        // Continue - operation is considered successful even if blob deletion fails
      }
    }
    // If storageKey is null (legacy video), skip storage deletion
  }
}
