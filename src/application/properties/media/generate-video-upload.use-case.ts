/**
 * Generate Video Upload Use Case
 *
 * Generates a signed upload URL for direct browser-to-storage upload.
 * This is the first step in the video upload flow.
 *
 * Flow:
 * 1. Validate request
 * 2. Load property
 * 3. Authorize actor
 * 4. Check video count limit
 * 5. Generate videoId and storageKey server-side
 * 6. Generate signed upload URL via ObjectStoragePort
 * 7. Return upload intent
 *
 * Security:
 * - propertyId comes from route (server-controlled)
 * - videoId generated server-side (CUID)
 * - storageKey generated server-side (controlled pattern)
 * - Client cannot choose arbitrary storage paths
 */

import { createId } from "@paralleldrive/cuid2";
import type { PropertyRepository } from "@/domain/property/property.repository";
import type { ObjectStoragePort } from "@/application/ports/storage/object-storage.port";
import type { UserRole } from "@/domain/user/user.types";
import {
  extractVideoExtension,
  generateVideoStorageKey,
  MAX_VIDEOS_PER_PROPERTY,
} from "@/application/ports/storage/storage-key.utils";
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

export interface GenerateVideoUploadInput {
  filename: string;
  contentType: string;
  size: number;
}

export interface VideoUploadIntent {
  uploadUrl: string;
  videoId: string;
  storageKey: string;
  expiresAt: Date;
}

export class GenerateVideoUploadUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly objectStorage: ObjectStoragePort
  ) {}

  async execute(
    propertyId: string,
    input: GenerateVideoUploadInput,
    actor: Actor
  ): Promise<VideoUploadIntent> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new EntityNotFoundError("Property", propertyId);
    }

    // 2. Authorization check (reuse existing property edit authorization)
    if (!canActorEditProperty(actor.id, actor.role, property)) {
      throw new UnauthorizedError("You are not authorized to upload videos to this property.");
    }

    // 3. Check video count limit
    const existingVideos = await this.propertyRepository.findVideos(propertyId);
    if (existingVideos.length >= MAX_VIDEOS_PER_PROPERTY) {
      throw new ValidationError(
        `Property has reached the maximum limit of ${MAX_VIDEOS_PER_PROPERTY} videos.`,
        { videoCount: `Maximum ${MAX_VIDEOS_PER_PROPERTY} videos allowed` }
      );
    }

    // 4. Extract and validate extension from filename
    let extension;
    try {
      extension = extractVideoExtension(input.filename);
    } catch (error) {
      throw new ValidationError(
        error instanceof Error ? error.message : "Invalid filename",
        { filename: "Invalid file extension" }
      );
    }

    // 5. Generate videoId server-side (CUID)
    const videoId = createId();

    // 6. Generate storageKey server-side (controlled pattern)
    const storageKey = generateVideoStorageKey(propertyId, videoId, extension);

    // 7. Generate signed upload URL via ObjectStoragePort
    const uploadIntent = await this.objectStorage.generateUploadUrl(
      storageKey,
      input.contentType,
      input.size
    );

    // 8. Return upload intent (application-level DTO)
    return {
      uploadUrl: uploadIntent.uploadUrl,
      videoId,
      storageKey: uploadIntent.storageKey,
      expiresAt: uploadIntent.expiresAt,
    };
  }
}
