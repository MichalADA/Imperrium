import { EntryType, PublicationStatus } from "@prisma/client";
import { Router } from "express";
import { entryCardSelect } from "../lib/entry-select.js";
import { prisma } from "../prisma.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (_request, response, next) => {
  try {
    const published = { status: PublicationStatus.PUBLISHED } as const;
    const [total, characters, provinces, languages, companies, events, houses, recent, featured, randomCount] =
      await Promise.all([
        prisma.entry.count({ where: published }),
        prisma.entry.count({ where: { ...published, type: EntryType.CHARACTER } }),
        prisma.entry.count({ where: { ...published, type: EntryType.PROVINCE } }),
        prisma.entry.count({ where: { ...published, type: EntryType.LANGUAGE } }),
        prisma.entry.count({ where: { ...published, type: EntryType.COMPANY } }),
        prisma.entry.count({ where: { ...published, type: EntryType.EVENT } }),
        prisma.entry.count({ where: { ...published, type: EntryType.HOUSE } }),
        prisma.entry.findMany({ where: published, orderBy: { updatedAt: "desc" }, take: 6, select: entryCardSelect }),
        prisma.entry.findMany({ where: { ...published, isFeatured: true }, orderBy: { title: "asc" }, take: 12, select: entryCardSelect }),
        prisma.entry.count({ where: published }),
      ]);

    const random = randomCount
      ? await prisma.entry.findFirst({
          where: published,
          skip: Math.floor(Math.random() * randomCount),
          select: entryCardSelect,
        })
      : null;

    response.json({
      stats: { total, characters, provinces, languages, officialLanguages: 8, companies, events, houses },
      worldScale: { provinces: 30, languages: 15, officialLanguages: 8 },
      recent,
      featured,
      random,
    });
  } catch (error) {
    next(error);
  }
});

