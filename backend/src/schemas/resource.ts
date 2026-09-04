import { EntryType, PublicationStatus } from "@prisma/client";
import { z } from "zod";

const infoboxValue = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const resourceInputSchema = z.object({
  slug: z.string().trim().min(1).max(100).optional(),
  type: z.nativeEnum(EntryType).optional(),
  displayName: z.string().trim().min(1).max(160).optional(),
  name: z.string().trim().min(1).max(160).optional(),
  title: z.string().trim().max(160).nullable().optional(),
  honorific: z.string().trim().max(160).nullable().optional(),
  firstName: z.string().trim().max(100).nullable().optional(),
  lastName: z.string().trim().max(120).nullable().optional(),
  summary: z.string().trim().max(800).nullable().optional(),
  description: z.string().trim().nullable().optional(),
  content: z.string().trim().nullable().optional(),
  aliases: z.array(z.string().trim().min(1)).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  infobox: z.record(infoboxValue).optional(),
  isFeatured: z.boolean().optional(),
  status: z.nativeEnum(PublicationStatus).optional(),
  birthYear: z.number().int().nullable().optional(),
  deathYear: z.number().int().nullable().optional(),
  reignStartYear: z.number().int().nullable().optional(),
  reignEndYear: z.number().int().nullable().optional(),
  changeNote: z.string().trim().max(300).optional(),
}).superRefine((value, context) => {
  if (value.birthYear != null && value.deathYear != null && value.deathYear < value.birthYear) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["deathYear"], message: "deathYear cannot be lower than birthYear" });
  }
  if (value.reignStartYear != null && value.reignEndYear != null && value.reignEndYear < value.reignStartYear) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reignEndYear"], message: "reignEndYear cannot be lower than reignStartYear" });
  }
});

export type ResourceInput = z.infer<typeof resourceInputSchema>;

export const relationshipTypeSchema = z.enum([
  "father",
  "mother",
  "parent",
  "child",
  "sibling",
  "twin",
  "spouse",
  "predecessor",
  "successor",
  "other",
]);

export type RelationshipType = z.infer<typeof relationshipTypeSchema>;

export const relationshipInputSchema = z.object({
  source: z.string().trim().min(1),
  target: z.string().trim().min(1),
  type: relationshipTypeSchema,
  description: z.string().trim().max(800).optional(),
});

export type RelationshipInput = z.infer<typeof relationshipInputSchema>;

const siblingSelectionSchema = z.union([
  z.string().trim().min(1).transform((target) => ({ target, type: "sibling" as const })),
  z.object({ target: z.string().trim().min(1), type: z.enum(["sibling", "twin"]).default("sibling") }),
]);

export const characterRelationshipsSchema = z.object({
  father: z.string().trim().min(1).nullable().optional(),
  mother: z.string().trim().min(1).nullable().optional(),
  parents: z.array(z.string().trim().min(1)).optional().default([]),
  siblings: z.array(siblingSelectionSchema).optional().default([]),
  spouses: z.array(z.string().trim().min(1)).optional().default([]),
  children: z.array(z.string().trim().min(1)).optional().default([]),
  predecessor: z.string().trim().min(1).nullable().optional(),
  successor: z.string().trim().min(1).nullable().optional(),
});

export type CharacterRelationshipsInput = z.infer<typeof characterRelationshipsSchema>;

const resourceCollections = {
  characters: z.array(resourceInputSchema).optional().default([]),
  provinces: z.array(resourceInputSchema).optional().default([]),
  cities: z.array(resourceInputSchema).optional().default([]),
  families: z.array(resourceInputSchema).optional().default([]),
  dynasties: z.array(resourceInputSchema).optional().default([]),
  languages: z.array(resourceInputSchema).optional().default([]),
  companies: z.array(resourceInputSchema).optional().default([]),
  institutions: z.array(resourceInputSchema).optional().default([]),
  universities: z.array(resourceInputSchema).optional().default([]),
  events: z.array(resourceInputSchema).optional().default([]),
  technologies: z.array(resourceInputSchema).optional().default([]),
  locations: z.array(resourceInputSchema).optional().default([]),
  articles: z.array(resourceInputSchema).optional().default([]),
  relationships: z.array(relationshipInputSchema).optional().default([]),
};

export const bulkInputSchema = z.object(resourceCollections);
export const importInputSchema = z.object({ mode: z.enum(["create", "upsert"]).default("upsert"), ...resourceCollections });

export type BulkInput = z.infer<typeof bulkInputSchema>;
export type ImportInput = z.infer<typeof importInputSchema>;
