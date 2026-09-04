import { EntryType, Prisma, PublicationStatus } from "@prisma/client";
import { Router } from "express";
import { ZodError } from "zod";
import { entryCardSelect } from "../lib/entry-select.js";
import { removeStoredImage } from "../lib/media.js";
import { createSlug } from "../lib/slug.js";
import { hasAdminAccess, requireAdmin } from "../middleware/admin.js";
import { prisma } from "../prisma.js";
import { entryInputSchema, type EntryInput } from "../schemas/entry.js";

export const entriesRouter = Router();

function searchable(input: EntryInput): string {
  return [input.title, input.summary, input.content, ...input.aliases, ...input.tags, ...Object.values(input.infobox)]
    .filter(Boolean)
    .join(" ");
}

entriesRouter.get("/", async (request, response, next) => {
  try {
    const type = String(request.query.type ?? "").toUpperCase();
    const requestedStatus = String(request.query.status ?? "").toUpperCase();
    const page = Math.max(1, Number(request.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 40));
    const canSeeDrafts = hasAdminAccess(request);

    const where: Prisma.EntryWhereInput = {
      ...(type && Object.values(EntryType).includes(type as EntryType) ? { type: type as EntryType } : {}),
      ...(canSeeDrafts && requestedStatus === PublicationStatus.DRAFT
        ? { status: PublicationStatus.DRAFT }
        : { status: PublicationStatus.PUBLISHED }),
    };

    const [items, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
        select: entryCardSelect,
      }),
      prisma.entry.count({ where }),
    ]);

    response.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

entriesRouter.get("/:slug/revisions", requireAdmin, async (request, response, next) => {
  try {
    const entry = await prisma.entry.findUnique({ where: { slug: String(request.params.slug) }, select: { id: true } });
    if (!entry) {
      response.status(404).json({ message: "Nie znaleziono wpisu." });
      return;
    }
    const revisions = await prisma.revision.findMany({ where: { entryId: entry.id }, orderBy: { createdAt: "desc" } });
    response.json({ revisions });
  } catch (error) {
    next(error);
  }
});

entriesRouter.get("/:slug", async (request, response, next) => {
  try {
    const entry = await prisma.entry.findUnique({
      where: { slug: String(request.params.slug) },
      include: {
        outgoing: { include: { target: { select: entryCardSelect } }, orderBy: { type: "asc" } },
        incoming: { include: { source: { select: entryCardSelect } }, orderBy: { type: "asc" } },
      },
    });

    if (!entry || (entry.status === PublicationStatus.DRAFT && !hasAdminAccess(request))) {
      response.status(404).json({ message: "Nie znaleziono wpisu." });
      return;
    }
    response.json(entry);
  } catch (error) {
    next(error);
  }
});

entriesRouter.post("/", requireAdmin, async (request, response, next) => {
  try {
    const input = entryInputSchema.parse(request.body);
    const baseSlug = createSlug(input.slug || input.title) || `wpis-${Date.now()}`;
    const existing = await prisma.entry.findUnique({ where: { slug: baseSlug }, select: { id: true } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
    const { changeNote: _changeNote, ...data } = input;

    const created = await prisma.entry.create({
      data: {
        ...data,
        slug,
        searchText: searchable(input),
        infobox: input.infobox as Prisma.InputJsonValue,
        revisions: {
          create: {
            title: input.title,
            summary: input.summary,
            content: input.content,
            infobox: input.infobox as Prisma.InputJsonValue,
            changeNote: input.changeNote || "Utworzenie wpisu",
          },
        },
      },
    });

    response.status(201).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ message: "Nieprawidłowe dane wpisu.", issues: error.issues });
      return;
    }
    next(error);
  }
});

entriesRouter.put("/:slug", requireAdmin, async (request, response, next) => {
  try {
    const input = entryInputSchema.parse(request.body);
    const current = await prisma.entry.findUnique({ where: { slug: String(request.params.slug) } });
    if (!current) {
      response.status(404).json({ message: "Nie znaleziono wpisu." });
      return;
    }

    const requestedSlug = createSlug(input.slug || current.slug) || current.slug;
    const { changeNote: _changeNote, ...data } = input;
    const updated = await prisma.$transaction(async (transaction) => {
      await transaction.revision.create({
        data: {
          entryId: current.id,
          title: current.title,
          summary: current.summary,
          content: current.content,
          infobox: current.infobox as Prisma.InputJsonValue,
          changeNote: input.changeNote || "Aktualizacja wpisu",
        },
      });
      return transaction.entry.update({
        where: { id: current.id },
        data: {
          ...data,
          slug: requestedSlug,
          searchText: searchable(input),
          infobox: input.infobox as Prisma.InputJsonValue,
        },
      });
    });

    response.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ message: "Nieprawidłowe dane wpisu.", issues: error.issues });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      response.status(409).json({ message: "Taki slug jest już zajęty." });
      return;
    }
    next(error);
  }
});

entriesRouter.delete("/:slug", requireAdmin, async (request, response, next) => {
  try {
    const entry = await prisma.entry.findUnique({
      where: { slug: String(request.params.slug) },
      include: { media: { select: { path: true } } },
    });
    if (!entry) {
      response.status(404).json({ message: "Nie znaleziono wpisu." });
      return;
    }
    await prisma.entry.delete({ where: { id: entry.id } });
    await Promise.all(entry.media.map((item) => removeStoredImage(item.path)));
    response.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      response.status(404).json({ message: "Nie znaleziono wpisu." });
      return;
    }
    next(error);
  }
});
