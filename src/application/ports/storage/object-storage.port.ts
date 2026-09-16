/**
 * Object Storage Port
 *
 * Application-level abstraction for external object storage.
 * Infrastructure provides provider-specific implementations (Vercel Blob, R2, S3, etc.).
 *
 * This interface is provider-agnostic and uses only domain/application types.
 * It must NOT expose provider-specific types (e.g., Vercel Blob SDK types).
 */

/**
 * Upload intent containing a pre-signed URL for direct browser upload.
 */
export interface UploadIntent {
  /** Pre-signed URL where the browser will upload the file directly */
  uploadUrl: string;
  /** Storage key where the object will be stored */
  storageKey: string;
  /** Timestamp when the upload URL expires */
  expiresAt: Date;
}

/**
 * Basic metadata about an object in storage.
 */
export interface ObjectMetadata {
  /** Whether the object exists in storage */
  exists: boolean;
  /** Size of the object in bytes (if exists) */
  size?: number;
  /** Content type of the object (if exists) */
  contentType?: string;
}

/**
 * Port for object storage operations.
 *
 * All methods use application-neutral types and storage keys.
 * The infrastructure adapter translates to/from provider-specific APIs.
 */
export interface ObjectStoragePort {
  /**
   * Generate a pre-signed URL for direct browser upload.
   *
   * The returned URL allows a browser to upload a file directly to storage
   * without proxying through the Next.js server.
   *
   * @param storageKey - Target storage path (e.g., "properties/x/images/y.jpg")
   * @param contentType - MIME type (e.g., "image/jpeg")
   * @param maxSizeBytes - Maximum allowed file size
   * @param expirySeconds - URL validity period (default: 300 seconds / 5 minutes)
   * @returns Upload intent with signed URL and metadata
   */
  generateUploadUrl(
    storageKey: string,
    contentType: string,
    maxSizeBytes: number,
    expirySeconds?: number
  ): Promise<UploadIntent>;

  /**
   * Check if an object exists and retrieve basic metadata.
   *
   * Used to verify upload completion before persisting database record.
   *
   * @param storageKey - Storage path to check
   * @returns Object metadata including existence and size
   */
  getObjectMetadata(storageKey: string): Promise<ObjectMetadata>;

  /**
   * Generate a public URL for an object.
   *
   * For public-readable storage, returns a CDN URL.
   * For private storage, may return a time-limited signed URL.
   *
   * @param storageKey - Storage path
   * @returns Public URL for accessing the object
   */
  getPublicUrl(storageKey: string): string;

  /**
   * Delete an object from storage.
   *
   * Called when a PropertyImage record is deleted.
   * Should not throw if the object doesn't exist (idempotent).
   *
   * @param storageKey - Storage path to delete
   */
  deleteObject(storageKey: string): Promise<void>;
}
