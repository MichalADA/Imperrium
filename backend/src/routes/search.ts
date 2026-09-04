import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../prisma.js";

type SearchRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  summary: string;
  aliases: string[];
  tags: string[];
  infobox: Record<string, unknown>;
  isFeatured: boolean;
  imagePath: string | null;
  birthYear: number | null;
  deathYear: number | null;
  reignStartYear: number | null;
  reignEndYear: number | null;
  updatedAt: Date;
};

export const searchRouter = Router();

searchRouter.get("/", async (request, response, next) => {
  try {
    const query = String(request.query.q ?? "").trim();
    if (query.length < 2) {
      response.json({ query, results: [] });
      return;
    }

    const contains = `%${query}%`;
    const results = await prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      SELECT
        "id", "slug", "title", "type", "status", "summary", "aliases", "tags",
        "infobox", "isFeatured", "imagePath", "birthYear", "deathYear",
        "reignStartYear", "reignEndYear", "updatedAt"
      FROM "Entry"
      WHERE "status" = 'PUBLISHED'::"PublicationStatus"
        AND (
          to_tsvector('simple', coalesce("searchText", '')) @@ plainto_tsquery('simple', ${query})
          OR "title" ILIKE ${contains}
          OR "summary" ILIKE ${contains}
          OR "searchText" ILIKE ${contains}
        )
      ORDER BY
        "isFeatured" DESC,
        ts_rank(to_tsvector('simple', coalesce("searchText", '')), plainto_tsquery('simple', ${query})) DESC,
        "title" ASC
      LIMIT 30
    `);

    response.json({ query, results });
  } catch (error) {
    next(error);
  }
});
