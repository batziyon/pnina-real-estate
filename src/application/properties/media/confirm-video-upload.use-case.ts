/**
 * Confirm Video Upload Use Case
 *
 * Confirms a successful browser-to-storage upload and creates the PropertyVideo database record.
 * This is the second and final step in the video upload flow.
 *
 * Flow:
 * 1. Load property
 * 2. Re-authorize actor
 * 3. Re-check video count limit
 * 4. Validate storageKey belongs to this property and videoId
 * 5. Verify object exists in storage
 * 6. Verify object metadata
 * 7. Determine sortOrder
 * 8. Create PropertyVideo record
 * 9. Return created video
 *
 * Security:
 * - propertyId from authenticated route (server-controlled)
 * - storageKey validated against expected pattern
 * - Re-checks authorization (upload URL alone is not authorization)
 * - Verifies object actually exists in storage
 * - Idempotent: retry returns existing video
 */

import type { PropertyRepository } from "@/domain/property/property.repository";
import type { ObjectStoragePort } from "@/application/ports/storage/object-storage.port";
import type { UserRole } from "@/domain/user/user.types";
import type { PropertyVideoData } from "@/domain/property/property.types";
import {
  validateVideoStorageKey,
  MAX_VIDEOS_PER_PROPERTY,
  MAX_VIDEO_SIZE_BYTES,
  isAllowedVideoMimeType,
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

export interface ConfirmVideoUploadInput {
  videoId: string;
  storageKey: string;
  contentType: string;
  size: number;
}

export class ConfirmVideoUploadUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly objectStorage: ObjectStoragePort
  ) {}

  async execute(
    propertyId: string,
    input: ConfirmVideoUploadInput,
    actor: Actor
  ): Promise<PropertyVideoData> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new EntityNotFoundError("Property", propertyId);
    }

    // 2. Re-check authorization (upload URL alone is not authorization)
    if (!canActorEditProperty(actor.id, actor.role, property)) {
      throw new UnauthorizedError(
        "You are not authorized to confirm uploads for this property."
      );
    }

    // 3. Validate storageKey belongs to this property and videoId
    if (!validateVideoStorageKey(input.storageKey, propertyId, input.videoId)) {
      throw new ValidationError(
        "Invalid storage key. Storage key must match expected pattern for this property and video.",
        { storageKey: "Invalid storage key pattern" }
      );
    }

    // 4. Check for idempotency: if video already exists with this videoId, return it
    const existingVideo = await this.propertyRepository.findVideoById(input.videoId);
    if (existingVideo) {
      // Video already confirmed - verify it belongs to this property and has matching storageKey
      if (existingVideo.propertyId !== propertyId) {
        throw new ValidationError(
          "Video ID already exists but belongs to a different property.",
          { videoId: "Video ID conflict with another property" }
        );
      }
      
      if (existingVideo.storageKey !== input.storageKey) {
        throw new ValidationError(
          "Video ID already exists but has a different storage key.",
          { videoId: "Video ID conflict with different storage key" }
        );
      }
      
      // Valid retry - return existing record (idempotent)
      return existingVideo;
    }

    // 5. Fetch existing videos for count check and sortOrder calculation
    const existingVideos = await this.propertyRepository.findVideos(propertyId);

    // 6. Re-check video count limit (prevent race conditions)
    if (existingVideos.length >= MAX_VIDEOS_PER_PROPERTY) {
      throw new ValidationError(
        `Property has reached the maximum limit of ${MAX_VIDEOS_PER_PROPERTY} videos.`,
        { videoCount: `Maximum ${MAX_VIDEOS_PER_PROPERTY} videos allowed` }
      );
    }

    // 7. Verify uploaded object exists in storage
    const metadata = await this.objectStorage.getObjectMetadata(input.storageKey);
    if (!metadata.exists) {
      throw new ValidationError(
        "Uploaded video not found in storage. Upload may have failed or expired.",
        { storageKey: "Object not found in storage" }
      );
    }

    // 8. Verify object size
    if (metadata.size && metadata.size > MAX_VIDEO_SIZE_BYTES) {
      throw new ValidationError(
        `Uploaded video exceeds maximum size of ${MAX_VIDEO_SIZE_BYTES / 1024 / 1024}MB.`,
        { size: "Video too large" }
      );
    }

    // 9. Verify content type (if available from storage)
    if (metadata.contentType && !isAllowedVideoMimeType(metadata.contentType)) {
      throw new ValidationError(
        `Invalid content type: ${metadata.contentType}. Must be video/mp4, video/webm, or video/quicktime.`,
        { contentType: "Invalid content type" }
      );
    }

    // 10. Validate client-provided content type
    if (!isAllowedVideoMimeType(input.contentType)) {
      throw new ValidationError(
        `Invalid content type: ${input.contentType}. Must be video/mp4, video/webm, or video/quicktime.`,
        { contentType: "Invalid content type" }
      );
    }

    // 11. Determine sortOrder (max + 1, or 0 if no videos)
    const sortOrder =
      existingVideos.length > 0
        ? Math.max(...existingVideos.map((vid) => vid.sortOrder)) + 1
        : 0;

    // 12. Generate public URL
    const url = this.objectStorage.getPublicUrl(input.storageKey);

    // 13. Create PropertyVideo record with client-provided videoId
    const video = await this.propertyRepository.addVideo(propertyId, {
      id: input.videoId,  // Use videoId from upload intent as PropertyVideo.id
      storageKey: input.storageKey,
      url,
      thumbnailUrl: null,  // No automatic thumbnail generation in this slice
      sortOrder,
    });

    return video;
  }
}
