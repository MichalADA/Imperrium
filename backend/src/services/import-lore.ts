import type { Prisma } from "@prisma/client";
import { HttpError, LoreValidationError, type LoreIssue } from "../lib/http-error.js";
import type { BulkInput, ImportInput } from "../schemas/resource.js";
import { createRelationship } from "./relationships.js";
import { createResource, resourceDefinitions, type ResourceName } from "./resources.js";

type ImportPayload = BulkInput | ImportInput;

export type ImportSummary = Record<string, number> & { relationshipsCreated: number };

export async function applyLoreImport(
  transaction: Prisma.TransactionClient,
  payload: ImportPayload,
  mode: "create" | "upsert",
): Promise<ImportSummary> {
  const summary: ImportSummary = { relationshipsCreated: 0 };
  const seen = new Set<string>();
  const errors: LoreIssue[] = [];

  for (const resource of Object.keys(resourceDefinitions) as ResourceName[]) {
    const items = payload[resource];
    summary[`${resource}Created`] = 0;
    summary[`${resource}Updated`] = 0;
    for (const item of items) {
      if (item.slug) {
        if (seen.has(item.slug)) errors.push({ entity: resource, slug: item.slug, field: "slug", message: "duplicate slug in import" });
        seen.add(item.slug);
      }
    }
  }
  if (errors.length) throw new LoreValidationError(errors);

  for (const resource of Object.keys(resourceDefinitions) as ResourceName[]) {
    for (const item of payload[resource]) {
      try {
        const result = await createResource(transaction, resource, item, mode);
        summary[`${resource}${result.action === "created" ? "Created" : "Updated"}`]++;
      } catch (error) {
        if (error instanceof HttpError && !(error instanceof LoreValidationError)) {
          throw new LoreValidationError([{ entity: resource.replace(/s$/, ""), slug: item.slug, field: "slug", message: error.message }]);
        }
        throw error;
      }
    }
  }
  for (const item of payload.relationships) {
    const result = await createRelationship(transaction, item);
    summary.relationshipsCreated += result.rowsCreated;
  }
  return summary;
}
