import { Router } from "express";
import { requireAdmin } from "../middleware/admin.js";
import { prisma } from "../prisma.js";
import { relationshipInputSchema } from "../schemas/resource.js";
import { createRelationship, deleteRelationship } from "../services/relationships.js";

export const relationshipsRouter = Router();

relationshipsRouter.get("/", async (request, response, next) => {
  try {
    const source = typeof request.query.source === "string" ? request.query.source : undefined;
    const sourceEntry = source ? await prisma.entry.findFirst({ where: { OR: [{ id: source }, { slug: source }] }, select: { id: true } }) : null;
    const relationships = await prisma.relation.findMany({
      where: source ? { sourceId: sourceEntry?.id ?? "missing" } : undefined,
      include: { source: { select: { id: true, slug: true, title: true } }, target: { select: { id: true, slug: true, title: true } } },
      orderBy: [{ source: { title: "asc" } }, { type: "asc" }, { target: { title: "asc" } }],
    });
    response.json({ relationships });
  } catch (error) { next(error); }
});

relationshipsRouter.post("/", requireAdmin, async (request, response, next) => {
  try {
    const input = relationshipInputSchema.parse(request.body);
    const result = await prisma.$transaction((transaction) => createRelationship(transaction, input));
    response.status(result.rowsCreated > 0 ? 201 : 200).json(result);
  } catch (error) { next(error); }
});

relationshipsRouter.patch("/:id", requireAdmin, async (request, response, next) => {
  try {
    const input = relationshipInputSchema.parse(request.body);
    const result = await prisma.$transaction(async (transaction) => {
      await deleteRelationship(transaction, String(request.params.id));
      return createRelationship(transaction, input);
    });
    response.json(result);
  } catch (error) { next(error); }
});

relationshipsRouter.delete("/:id", requireAdmin, async (request, response, next) => {
  try {
    await prisma.$transaction((transaction) => deleteRelationship(transaction, String(request.params.id)));
    response.status(204).send();
  } catch (error) { next(error); }
});
