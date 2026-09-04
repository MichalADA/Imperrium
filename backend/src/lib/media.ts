import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const UPLOAD_DIRECTORY = path.resolve(process.env.UPLOAD_DIR || "/app/uploads");

const supportedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export class ImageValidationError extends Error {}

export function isSupportedImageMime(mimeType: string): boolean {
  return supportedMimeTypes.has(mimeType.toLowerCase());
}

export function detectImage(buffer: Buffer): { mimeType: string; extension: string } | null {
  if (
    buffer.length >= 4 &&
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff &&
    buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9
  ) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }
  if (
    buffer.length >= 32 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a &&
    buffer.subarray(12, 16).toString("ascii") === "IHDR" &&
    buffer.subarray(buffer.length - 8, buffer.length - 4).toString("ascii") === "IEND"
  ) {
    return { mimeType: "image/png", extension: "png" };
  }
  if (
    buffer.length >= 20 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP" &&
    ["VP8 ", "VP8L", "VP8X"].includes(buffer.subarray(12, 16).toString("ascii")) &&
    buffer.readUInt32LE(4) + 8 === buffer.length
  ) {
    return { mimeType: "image/webp", extension: "webp" };
  }
  return null;
}

export async function ensureUploadDirectory(): Promise<void> {
  await mkdir(UPLOAD_DIRECTORY, { recursive: true, mode: 0o750 });
}

export async function storeImage(buffer: Buffer, claimedMimeType: string): Promise<{ path: string; mimeType: string; sizeBytes: number }> {
  if (!buffer.length) throw new ImageValidationError("Plik jest pusty.");
  if (buffer.length > MAX_IMAGE_SIZE) throw new ImageValidationError("Zdjęcie przekracza limit 10 MB.");

  const detected = detectImage(buffer);
  if (!detected || !isSupportedImageMime(detected.mimeType)) {
    throw new ImageValidationError("Plik nie jest prawidłowym obrazem JPG, PNG ani WEBP.");
  }
  if (detected.mimeType !== claimedMimeType.toLowerCase()) {
    throw new ImageValidationError("Zadeklarowany typ MIME nie zgadza się z zawartością pliku.");
  }

  await ensureUploadDirectory();
  const safeName = `${randomUUID()}.${detected.extension}`;
  await writeFile(resolveStoredPath(safeName), buffer, { flag: "wx", mode: 0o640 });
  return { path: safeName, mimeType: detected.mimeType, sizeBytes: buffer.length };
}

export function resolveStoredPath(fileName: string): string {
  if (!fileName || path.basename(fileName) !== fileName || fileName.includes("..")) {
    throw new ImageValidationError("Nieprawidłowa ścieżka pliku.");
  }
  const resolved = path.resolve(UPLOAD_DIRECTORY, fileName);
  if (!resolved.startsWith(`${UPLOAD_DIRECTORY}${path.sep}`)) {
    throw new ImageValidationError("Nieprawidłowa ścieżka pliku.");
  }
  return resolved;
}

export async function removeStoredImage(fileName: string | null | undefined): Promise<void> {
  if (!fileName) return;
  try {
    await unlink(resolveStoredPath(fileName));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
