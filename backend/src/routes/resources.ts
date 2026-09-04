import { Prisma } from "@prisma/client";
import { Router } from "express";
import { ZodError } from "zod";
import { removeStoredImage } from "../lib/media.js";
import { hasAdminAccess, requireAdmin } from "../middleware/admin.js";
import { prisma } from "../prisma.js";
import { characterRelationshipsSchema, resourceInputSchema } from "../schemas/resource.js";
import { createResource, listResources, resolveEntry, resourceDefinitions, serializeResource, type ResourceName } from "../services/resources.js";
import { getCharacterRelationships, replaceCharacterRelationships } from "../services/relationships.js";

export function resourceRouter(resource: ResourceName): Router {
  const router = Router();

  router.get("/", async (request, response, next) => {
    try {
      response.json(await listResources(prisma, resource, {
        search: typeof request.query.search === "string" ? request.query.search : undefined,
        page: Number(request.query.page) || 1,
        limit: Number(request.query.limit) || 40,
        includeDrafts: hasAdminAccess(request),
      }));
    } catch (error) { next(error); }
  });

  if (resource === "characters") {
    router.get("/:identifier/relationships", async (request, response, next) => {
      try { response.json({ relationships: await getCharacterRelationships(prisma, String(request.params.identifier)) }); }
      catch (error) { next(error); }
    });
    router.patch("/:identifier/relationships", requireAdmin, async (request, response, next) => {
      try {
        const input = characterRelationshipsSchema.parse(request.body);
        await prisma.$transaction((transaction) => replaceCharacterRelationships(transaction, String(request.params.identifier), input));
        response.json({ relationships: await getCharacterRelationships(prisma, String(request.params.identifier)) });
      } catch (error) { next(error); }
    });
  }

  router.get("/:identifier", async (request, response, next) => {
    try {
      const entry = await resolveEntry(prisma, String(request.params.identifier), resourceDefinitions[resource]);
      if (!hasAdminAccess(request) && entry.status !== "PUBLISHED") { response.status(404).json({ message: "Nie znaleziono wpisu." }); return; }
      response.json(serializeResource(entry));
    } catch (error) { next(error); }
  });

  router.post("/", requireAdmin, async (request, response, next) => {
    try {
      const input = resourceInputSchema.parse(request.body);
      const result = await prisma.$transaction((transaction) => createResource(transaction, resource, input));
      response.status(201).json(serializeResource(result.entry));
    } catch (error) { next(error); }
  });

  router.patch("/:identifier", requireAdmin, async (request, response, next) => {
    try {
      const input = resourceInputSchema.parse(request.body);
      const entry = await prisma.$transaction(async (transaction) => {
        const { updateResource } = await import("../services/resources.js");
        return updateResource(transaction, resource, String(request.params.identifier), input);
      });
      response.json(serializeResource(entry));
    } catch (error) { next(error); }
  });

  router.delete("/:identifier", requireAdmin, async (request, response, next) => {
    try {
      const entry = await resolveEntry(prisma, String(request.params.identifier), resourceDefinitions[resource]);
      const media = await prisma.media.findMany({ where: { entryId: entry.id }, select: { path: true } });
      await prisma.entry.delete({ where: { id: entry.id } });
      await Promise.all(media.map(({ path }) => removeStoredImage(path)));
      response.status(204).send();
    } catch (error) { next(error); }
  });

  return router;
}

export function apiValidationError(error: unknown): { status: number; body: unknown } | null {
  if (error instanceof ZodError) return {
    status: 400,
    body: {
      valid: false,
      warnings: [],
      errors: error.issues.map((issue) => ({
        entity: typeof issue.path[0] === "string" ? String(issue.path[0]).replace(/s$/, "") : "request",
        field: issue.path.length ? String(issue.path[issue.path.length - 1]) : undefined,
        message: issue.message,
      })),
    },
  };
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { status: 409, body: { message: "Slug musi być unikalny." } };
  return null;
}
