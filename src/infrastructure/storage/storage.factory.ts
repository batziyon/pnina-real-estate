/**
 * Storage Factory
 *
 * Creates ObjectStoragePort implementations based on configuration.
 * Currently supports only Vercel Blob (MVP decision).
 *
 * Future providers (R2, S3) can be added here when needed.
 */

import type { ObjectStoragePort } from "@/application/ports/storage/object-storage.port";
import { VercelBlobStorageAdapter } from "./vercel-blob-storage.adapter";

/**
 * Create an ObjectStoragePort implementation.
 *
 * Currently returns Vercel Blob adapter.
 * Future: Could read STORAGE_PROVIDER env var to switch providers.
 */
export function createObjectStorage(): ObjectStoragePort {
  // MVP: Always use Vercel Blob
  return new VercelBlobStorageAdapter();
}
