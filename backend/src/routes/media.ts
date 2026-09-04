import { EntryType, MediaRole } from "@prisma/client";
import { Router, type Request } from "express";
import multer from "multer";
import { ImageValidationError, MAX_IMAGE_SIZE, isSupportedImageMime, removeStoredImage, storeImage } from "../lib/media.js";
import { requireAdmin } from "../middleware/admin.js";
import { prisma } from "../prisma.js";

export const mediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1, fields: 0 },
  fileFilter: (_request, file, callback) => {
    if (!isSupportedImageMime(file.mimetype)) {
      callback(new ImageValidationError("Dozwolone są wyłącznie obrazy JPG, JPEG, PNG i WEBP."));
      return;
    }
    callback(null, true);
  },
});

function roleFor(type: EntryType): MediaRole | null {
  if (type === EntryType.CHARACTER) return MediaRole.PROFILE;
  if (type === EntryType.PROVINCE) return MediaRole.COVER;
  return null;
}

function expectedType(request: Request): EntryType | undefined {
  if (request.baseUrl.endsWith("/characters")) return EntryType.CHARACTER;
  if (request.baseUrl.endsWith("/provinces")) return EntryType.PROVINCE;
  return undefined;
}

mediaRouter.post("/:slug/image", requireAdmin, upload.single("image"), async (request, response, next) => {
  try {
    if (!request.file) {
      response.status(400).json({ message: "Nie przesłano zdjęcia." });
      return;
    }

    const identifier = String(request.params.slug);
    const entry = await prisma.entry.findFirst({
      where: { OR: [{ id: identifier }, { slug: identifier }], ...(expectedType(request) ? { type: expectedType(request) } : {}) },
      select: { id: true, title: true, type: true },
    });
    if (!entry) {
      response.status(404).json({ message: "Nie znaleziono wpisu." });
      return;
    }

    const role = roleFor(entry.type);
    if (!role) {
      response.status(400).json({ message: "Zdjęcie główne można dodać tylko do postaci lub prowincji." });
      return;
    }

    const stored = await storeImage(request.file.buffer, request.file.mimetype);
    try {
      const result = await prisma.$transaction(async (transaction) => {
        const replaced = await transaction.media.findMany({ where: { entryId: entry.id, role }, select: { path: true } });
        await transaction.media.deleteMany({ where: { entryId: entry.id, role } });
        const created = await transaction.media.create({
          data: { entryId: entry.id, role, ...stored, altText: entry.title, position: 0 },
        });
        await transaction.entry.update({ where: { id: entry.id }, data: { imagePath: stored.path } });
        return { media: created, replaced };
      });

      await Promise.all(result.replaced.map((item) => removeStoredImage(item.path)));
      response.status(201).json({ imagePath: stored.path, imageUrl: `/uploads/${stored.path}`, media: result.media });
    } catch (error) {
      await removeStoredImage(stored.path);
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

mediaRouter.delete("/:slug/image", requireAdmin, async (request, response, next) => {
  try {
    const identifier = String(request.params.slug);
    const entry = await prisma.entry.findFirst({
      where: { OR: [{ id: identifier }, { slug: identifier }], ...(expectedType(request) ? { type: expectedType(request) } : {}) },
      select: { id: true, type: true },
    });
    if (!entry) {
      response.status(404).json({ message: "Nie znaleziono wpisu." });
      return;
    }

    const role = roleFor(entry.type);
    if (!role) {
      response.status(400).json({ message: "Ten typ wpisu nie posiada zdjęcia głównego." });
      return;
    }

    const previous = await prisma.$transaction(async (transaction) => {
      const paths = await transaction.media.findMany({ where: { entryId: entry.id, role }, select: { path: true } });
      await transaction.media.deleteMany({ where: { entryId: entry.id, role } });
      await transaction.entry.update({ where: { id: entry.id }, data: { imagePath: null } });
      return paths;
    });
    await Promise.all(previous.map((item) => removeStoredImage(item.path)));
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
