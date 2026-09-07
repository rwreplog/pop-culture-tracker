import { randomUUID } from "node:crypto";

import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

const BUCKET = "custom-art";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const files = new Files({ adapter: neon({ bucket: BUCKET }) });

export type UploadCustomArtResult =
  { success: true; key: string } | { success: false; error: string };

/** Uploads a user's custom artwork for a library item. Validates type/size. */
export async function uploadCustomArt(
  userId: string,
  libraryItemId: string,
  file: File,
): Promise<UploadCustomArtResult> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return {
      success: false,
      error: "Please upload a JPEG, PNG, WEBP, or GIF image.",
    };
  }
  if (file.size > MAX_BYTES) {
    return { success: false, error: "Images must be 5MB or smaller." };
  }

  const key = `custom-art/${userId}/${libraryItemId}/${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await files.upload(key, bytes, { contentType: file.type });

  return { success: true, key };
}

/** Presigns a short-lived GET url for a custom art object key. */
export async function presignCustomArtUrl(key: string): Promise<string> {
  return files.url(key, { expiresIn: 3600 });
}

/** Deletes a custom art object. Safe to call on a key that no longer exists. */
export async function deleteCustomArt(key: string): Promise<void> {
  await files.delete(key);
}
