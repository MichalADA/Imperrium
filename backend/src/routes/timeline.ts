import { EntryType, PublicationStatus } from "@prisma/client";
import { Router } from "express";
import { entryCardSelect } from "../lib/entry-select.js";
import { prisma } from "../prisma.js";

export const timelineRouter = Router();

timelineRouter.get("/", async (request, response, next) => {
  try {
    const category = String(request.query.category ?? "").trim().toLowerCase();
    const events = await prisma.entry.findMany({
      where: {
        status: PublicationStatus.PUBLISHED,
        type: EntryType.EVENT,
        ...(category ? { tags: { has: category } } : {}),
      },
      select: entryCardSelect,
    });

    events.sort((a, b) => {
      const first = a.infobox as Record<string, unknown>;
      const second = b.infobox as Record<string, unknown>;
      return Number(first.kolejnosc ?? first.rok ?? 0) - Number(second.kolejnosc ?? second.rok ?? 0);
    });
    response.json({ events });
  } catch (error) {
    next(error);
  }
});
