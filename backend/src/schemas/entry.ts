import { EntryType, PublicationStatus } from "@prisma/client";
import { z } from "zod";

const infoboxValue = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const entryInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(100).optional(),
  type: z.nativeEnum(EntryType),
  status: z.nativeEnum(PublicationStatus).default(PublicationStatus.DRAFT),
  summary: z.string().trim().min(2).max(800),
  content: z.string().trim().min(2),
  aliases: z.array(z.string().trim().min(1)).default([]),
  tags: z.array(z.string().trim().min(1)).default([]),
  infobox: z.record(infoboxValue).default({}),
  isFeatured: z.boolean().default(false),
  birthYear: z.number().int().nullable().optional(),
  deathYear: z.number().int().nullable().optional(),
  reignStartYear: z.number().int().nullable().optional(),
  reignEndYear: z.number().int().nullable().optional(),
  changeNote: z.string().trim().max(300).optional(),
}).superRefine((value, context) => {
  if (value.birthYear != null && value.deathYear != null && value.deathYear < value.birthYear) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["deathYear"], message: "Rok śmierci nie może być wcześniejszy niż rok urodzenia." });
  }
  if (value.reignStartYear != null && value.reignEndYear != null && value.reignEndYear < value.reignStartYear) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reignEndYear"], message: "Koniec panowania nie może być wcześniejszy niż jego początek." });
  }
});

export type EntryInput = z.infer<typeof entryInputSchema>;
