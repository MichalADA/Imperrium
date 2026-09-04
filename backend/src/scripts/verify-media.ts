import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "imperium-media-"));
process.env.UPLOAD_DIR = temporaryDirectory;

try {
  const media = await import("../lib/media.js");
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
  const stored = await media.storeImage(png, "image/png");
  if (!/^[0-9a-f-]{36}\.png$/.test(stored.path)) throw new Error("Nazwa uploadu nie jest bezpiecznym UUID.");
  const saved = await stat(media.resolveStoredPath(stored.path));
  if (!saved.isFile() || saved.size !== png.length) throw new Error("Obraz nie został trwale zapisany.");

  const rejectedInputs: Array<[Buffer, string]> = [
    [png, "image/jpeg"],
    [Buffer.from("#!/bin/sh\necho executable"), "image/png"],
    [Buffer.alloc(media.MAX_IMAGE_SIZE + 1), "image/png"],
  ];
  for (const [buffer, mimeType] of rejectedInputs) {
    let rejected = false;
    try {
      await media.storeImage(buffer, mimeType);
    } catch (error) {
      rejected = error instanceof media.ImageValidationError;
    }
    if (!rejected) throw new Error(`Nieprawidłowy upload został przyjęty (${mimeType}).`);
  }

  let traversalRejected = false;
  try {
    media.resolveStoredPath("../payload.png");
  } catch (error) {
    traversalRejected = error instanceof media.ImageValidationError;
  }
  if (!traversalRejected) throw new Error("Próba path traversal nie została odrzucona.");

  console.log("Media storage verified: MIME, signatures, 10 MB limit, UUID names and traversal protection.");
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
