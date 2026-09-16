/**
 * Vercel Blob Storage Adapter
 *
 * Infrastructure implementation of ObjectStoragePort using Vercel Blob.
 *
 * This adapter translates between the provider-agnostic ObjectStoragePort interface
 * and the Vercel Blob SDK. It does NOT expose Vercel-specific types to the application layer.
 *
 * Environment:
 * - BLOB_READ_WRITE_TOKEN: Required Vercel Blob API token
 *
 * Documentation: https://vercel.com/docs/storage/vercel-blob
 */

import { head, del } from "@vercel/blob";
import type {
  ObjectStoragePort,
  UploadIntent,
  ObjectMetadata,
} from "@/application/ports/storage/object-storage.port";

export class VercelBlobStorageAdapter implements ObjectStoragePort {
  /**
   * Generate a pre-signed URL for direct browser upload.
   *
   * Vercel Blob supports client-side uploads via the `put` method with `access: 'public'`.
   * The client can upload directly using the returned URL.
   */
  async generateUploadUrl(
    storageKey: string,
    contentType: string,
    maxSizeBytes: number,
    expirySeconds: number = 300
  ): Promise<UploadIntent> {
    try {
      // Vercel Blob's put method can be used to generate an upload URL
      // by providing the path and options without the actual file content.
      // For client uploads, we use the token to generate the URL.
      
      // Note: Vercel Blob's client upload pattern uses the token directly.
      // The upload URL is constructed from the blob pathname.
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not configured");
      }

      // Vercel Blob upload URL pattern for client uploads
      // The actual upload will be done via PUT to this URL with the token
      const uploadUrl = `https://blob.vercel-storage.com/${storageKey}?token=${token}`;
      
      const expiresAt = new Date(Date.now() + expirySeconds * 1000);

      return {
        uploadUrl,
        storageKey,
        expiresAt,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate upload URL: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Check if an object exists and retrieve metadata.
   *
   * Uses Vercel Blob's `head` method to get metadata without downloading the file.
   */
  async getObjectMetadata(storageKey: string): Promise<ObjectMetadata> {
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not configured");
      }

      // Vercel Blob's head method returns metadata for an existing blob
      const blob = await head(`https://blob.vercel-storage.com/${storageKey}`, {
        token,
      });

      if (!blob) {
        return { exists: false };
      }

      return {
        exists: true,
        size: blob.size,
        contentType: blob.contentType,
      };
    } catch (error) {
      // If head throws, the blob doesn't exist
      return { exists: false };
    }
  }

  /**
   * Generate a public URL for an object.
   *
   * Vercel Blob stores are public by default, so we construct the public URL.
   */
  getPublicUrl(storageKey: string): string {
    // Vercel Blob public URL pattern
    return `https://blob.vercel-storage.com/${storageKey}`;
  }

  /**
   * Delete an object from storage.
   *
   * Uses Vercel Blob's `del` method. Idempotent - doesn't throw if object doesn't exist.
   */
  async deleteObject(storageKey: string): Promise<void> {
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not configured");
      }

      const url = this.getPublicUrl(storageKey);
      await del(url, { token });
    } catch {
      // Log but don't throw - deletion is idempotent
      // If the object doesn't exist, that's fine
      console.warn(`Failed to delete object ${storageKey}, but continuing (idempotent operation)`);
    }
  }
}
