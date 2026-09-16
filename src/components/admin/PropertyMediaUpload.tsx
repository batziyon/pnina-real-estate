"use client";

/**
 * Property Media Upload Component
 *
 * Comprehensive image management for property media:
 * - Upload multiple images
 * - View image grid
 * - Delete images
 * - Set main image
 * - Reorder images (drag and drop)
 */

import { useState, useRef, useEffect } from "react";
import type { PropertyImageData } from "@/domain/property/property.types";

interface ImageUploadState {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  progress?: number;
}

interface Props {
  propertyId: string;
  onUploadComplete?: () => void;
}

export function PropertyMediaUpload({ propertyId, onUploadComplete }: Props) {
  const [uploads, setUploads] = useState<Map<string, ImageUploadState>>(new Map());
  const [images, setImages] = useState<PropertyImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingMain, setSettingMain] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, [propertyId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/properties/${propertyId}/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name}: לא קובץ תמונה`);
        return false;
      }
      
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: סוג קובץ לא נתמך`);
        return false;
      }
      
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`${file.name}: הקובץ גדול מדי (מקסימום 10MB)`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    const newUploads = new Map(uploads);
    validFiles.forEach((file) => {
      newUploads.set(file.name, { file, status: "pending" });
    });
    setUploads(newUploads);

    validFiles.forEach((file) => uploadImage(file));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File) => {
    const fileName = file.name;

    try {
      setUploads((prev) => {
        const next = new Map(prev);
        next.set(fileName, { file, status: "uploading", progress: 0 });
        return next;
      });

      const intentResponse = await fetch(
        `/api/admin/properties/${propertyId}/images/generate-upload-url`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        }
      );

      if (!intentResponse.ok) {
        const error = await intentResponse.json();
        throw new Error(error.error || "Failed to generate upload URL");
      }

      const intent = await intentResponse.json();
      const { uploadUrl, imageId, storageKey } = intent;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-content-type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to storage");
      }

      setUploads((prev) => {
        const next = new Map(prev);
        next.set(fileName, { file, status: "uploading", progress: 50 });
        return next;
      });

      const confirmResponse = await fetch(
        `/api/admin/properties/${propertyId}/images/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageId,
            storageKey,
            contentType: file.type,
            size: file.size,
            alt: "",
          }),
        }
      );

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json();
        throw new Error(error.error || "Failed to confirm upload");
      }

      setUploads((prev) => {
        const next = new Map(prev);
        next.set(fileName, { file, status: "success", progress: 100 });
        return next;
      });

      await loadImages();

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      setUploads((prev) => {
        const next = new Map(prev);
        next.set(fileName, {
          file,
          status: "error",
          error: error instanceof Error ? error.message : "העלאה נכשלה",
        });
        return next;
      });
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק תמונה זו?")) {
      return;
    }

    try {
      setDeleting(imageId);
      const response = await fetch(
        `/api/admin/properties/${propertyId}/images/${imageId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "מחיקה נכשלה");
      }

      await loadImages();
    } catch (error) {
      alert(error instanceof Error ? error.message : "מחיקה נכשלה");
    } finally {
      setDeleting(null);
    }
  };

  const handleSetMain = async (imageId: string) => {
    try {
      setSettingMain(imageId);
      const response = await fetch(
        `/api/admin/properties/${propertyId}/images/${imageId}/main`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "עדכון נכשל");
      }

      await loadImages();
    } catch (error) {
      alert(error instanceof Error ? error.message : "עדכון נכשל");
    } finally {
      setSettingMain(null);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      setReordering(true);
      const imageIds = images.map(img => img.id);
      
      const response = await fetch(
        `/api/admin/properties/${propertyId}/images/reorder`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageIds }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "סידור מחדש נכשל");
      }

      await loadImages();
    } catch (error) {
      alert(error instanceof Error ? error.message : "סידור מחדש נכשל");
      await loadImages();
    } finally {
      setReordering(false);
      setDraggedIndex(null);
    }
  };

  const clearCompleted = () => {
    setUploads((prev) => {
      const next = new Map(prev);
      Array.from(next.entries()).forEach(([key, value]) => {
        if (value.status === "success" || value.status === "error") {
          next.delete(key);
        }
      });
      return next;
    });
  };

  const uploadArray = Array.from(uploads.values());
  const hasUploads = uploadArray.length > 0;
  const hasCompleted = uploadArray.some(
    (u) => u.status === "success" || u.status === "error"
  );

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id={`image-upload-${propertyId}`}
        />
        <label
          htmlFor={`image-upload-${propertyId}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
        >
          <svg className="ml-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          העלה תמונות
        </label>
        <p className="mt-2 text-sm text-gray-500">
          JPEG, PNG או WebP. מקסימום 10MB לקובץ.
        </p>
      </div>

      {hasUploads && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              תמונות בהעלאה ({uploadArray.length})
            </h4>
            {hasCompleted && (
              <button onClick={clearCompleted} className="text-sm text-gray-600 hover:text-gray-900">
                נקה הושלם
              </button>
            )}
          </div>

          <div className="space-y-2">
            {uploadArray.map((upload) => (
              <div key={upload.file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3 space-x-reverse flex-1">
                  <div className="flex-shrink-0">
                    {upload.status === "pending" && <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />}
                    {upload.status === "uploading" && <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                    {upload.status === "success" && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {upload.status === "error" && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{upload.file.name}</p>
                    <p className="text-xs text-gray-500">{(upload.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {upload.status === "error" && upload.error && (
                      <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {upload.status === "pending" && "ממתין"}
                  {upload.status === "uploading" && "מעלה..."}
                  {upload.status === "success" && "הושלם"}
                  {upload.status === "error" && "נכשל"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : images.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">תמונות ({images.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable={!reordering}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group rounded-lg overflow-hidden border-2 ${
                  image.isMain ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                } ${draggedIndex === index ? "opacity-50" : ""} cursor-move`}
              >
                <img src={image.url} alt={image.alt || "תמונת נכס"} className="w-full h-40 object-cover" />
                
                {image.isMain && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
                    תמונה ראשית
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!image.isMain && (
                    <button
                      onClick={() => handleSetMain(image.id)}
                      disabled={settingMain === image.id}
                      className="px-3 py-1 bg-white text-gray-900 text-xs font-medium rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      {settingMain === image.id ? "..." : "הגדר כראשית"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={deleting === image.id}
                    className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleting === image.id ? "..." : "מחק"}
                  </button>
                </div>
                
                <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          {reordering && <p className="text-sm text-gray-500 mt-2">מבצע סידור מחדש...</p>}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>אין תמונות עדיין. העלה תמונות כדי להתחיל.</p>
        </div>
      )}
    </div>
  );
}
