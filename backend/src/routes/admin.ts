import { Router } from "express";
import { z, type ZodTypeAny } from "zod";
import { LoreValidationError } from "../lib/http-error.js";
import { requireAdmin } from "../middleware/admin.js";
import { prisma } from "../prisma.js";
import { bulkInputSchema, importInputSchema } from "../schemas/resource.js";
import { applyLoreImport, type ImportSummary } from "../services/import-lore.js";

export const adminRouter = Router();

class DryRunRollback extends Error {
  constructor(public readonly summary: ImportSummary) { super("dry-run rollback"); }
}

function parseLorePayload<S extends ZodTypeAny>(schema: S, body: unknown): z.output<S> {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  const record = typeof body === "object" && body ? body as Record<string, unknown> : {};
  throw new LoreValidationError(result.error.issues.map((issue) => {
    const collection = typeof issue.path[0] === "string" ? issue.path[0] : "request";
    const index = typeof issue.path[1] === "number" ? issue.path[1] : undefined;
    const items = Array.isArray(record[collection]) ? record[collection] as Array<Record<string, unknown>> : [];
    return {
      entity: collection.replace(/s$/, ""),
      slug: index === undefined || typeof items[index]?.slug !== "string" ? undefined : String(items[index].slug),
      field: issue.path.length ? String(issue.path[issue.path.length - 1]) : undefined,
      message: issue.message,
    };
  }));
}

adminRouter.use(requireAdmin);

adminRouter.post("/bulk", async (request, response, next) => {
  try {
    const payload = parseLorePayload(bulkInputSchema, request.body);
    const summary = await prisma.$transaction((transaction) => applyLoreImport(transaction, payload, "create"));
    response.status(201).json({ valid: true, summary, warnings: [], errors: [] });
  } catch (error) { next(error); }
});

adminRouter.post("/import", async (request, response, next) => {
  const dryRun = String(request.query.dryRun ?? "false").toLowerCase() === "true";
  try {
    const payload = parseLorePayload(importInputSchema, request.body);
    const summary = await prisma.$transaction(async (transaction) => {
      const result = await applyLoreImport(transaction, payload, payload.mode);
      if (dryRun) throw new DryRunRollback(result);
      return result;
    });
    response.json({ valid: true, dryRun: false, summary, warnings: [], errors: [] });
  } catch (error) {
    if (error instanceof DryRunRollback) {
      response.json({ valid: true, dryRun: true, summary: error.summary, warnings: [], errors: [] });
      return;
    }
    next(error);
  }
});
