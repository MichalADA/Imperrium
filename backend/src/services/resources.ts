import { EntryType, Prisma, PublicationStatus, type Entry } from "@prisma/client";
import { HttpError, LoreValidationError, type LoreIssue } from "../lib/http-error.js";
import { createSlug } from "../lib/slug.js";
import type { ResourceInput } from "../schemas/resource.js";

export const resourceDefinitions = {
  characters: EntryType.CHARACTER,
  provinces: EntryType.PROVINCE,
  cities: EntryType.CITY,
  families: EntryType.HOUSE,
  dynasties: EntryType.DYNASTY,
  languages: EntryType.LANGUAGE,
  companies: EntryType.COMPANY,
  institutions: EntryType.INSTITUTION,
  universities: EntryType.UNIVERSITY,
  events: EntryType.EVENT,
  technologies: EntryType.TECHNOLOGY,
  locations: EntryType.GEOGRAPHY,
  articles: EntryType.ARTICLE,
} as const;

export type ResourceName = keyof typeof resourceDefinitions;
export type DatabaseClient = Prisma.TransactionClient;

export function resourceType(name: ResourceName, inputType?: EntryType): EntryType {
  const fixed = resourceDefinitions[name];
  if (fixed) {
    if (inputType && inputType !== fixed) throw new HttpError(400, `Endpoint /${name} obsługuje wyłącznie typ ${fixed}.`);
    return fixed;
  }
  if (!inputType) throw new LoreValidationError([{ entity: "article", field: "type", message: "type is required" }]);
  return inputType;
}

export async function resolveEntry(database: DatabaseClient, identifier: string, expectedType?: EntryType | null): Promise<Entry> {
  const entry = await database.entry.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
      ...(expectedType ? { type: expectedType } : {}),
    },
  });
  if (!entry) throw new HttpError(404, "Nie znaleziono wpisu.");
  return entry;
}

function normalizedNullable(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function getDisplayName(type: EntryType, input: ResourceInput, current?: Entry): string {
  const explicit = input.displayName || input.name;
  if (explicit) return explicit;
  if (type === EntryType.CHARACTER) {
    const firstName = input.firstName === undefined ? current?.firstName : input.firstName;
    const lastName = input.lastName === undefined ? current?.lastName : input.lastName;
    const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (combined) return combined;
    if (current) return current.title;
    throw new LoreValidationError([{ entity: "character", slug: input.slug, field: "firstName", message: "Provide firstName/lastName or displayName" }]);
  }
  if (typeof input.title === "string" && input.title.trim()) return input.title.trim();
  if (current) return current.title;
  throw new LoreValidationError([{ entity: type.toLowerCase(), slug: input.slug, field: "title", message: "title or name is required" }]);
}

function buildData(type: EntryType, input: ResourceInput, current?: Entry): Prisma.EntryUncheckedCreateInput {
  const title = getDisplayName(type, input, current);
  const descriptionWasSet = input.description !== undefined;
  const contentWasSet = input.content !== undefined;
  const content = contentWasSet
    ? (input.content || "Brak danych.")
    : descriptionWasSet
      ? (input.description || "Brak danych.")
      : (current?.content || "Brak danych.");
  const summary = input.summary !== undefined
    ? (input.summary || "Brak danych.")
    : descriptionWasSet
      ? (input.description || "Brak danych.").slice(0, 800)
      : (current?.summary || content.slice(0, 800));
  const aliases = input.aliases ?? current?.aliases ?? [];
  const tags = input.tags ?? current?.tags ?? [];
  const infobox = input.infobox ?? (current?.infobox as Record<string, string | number | boolean | null> | undefined) ?? {};
  const firstName = type === EntryType.CHARACTER
    ? (normalizedNullable(input.firstName) ?? (input.firstName === undefined ? current?.firstName : null))
    : null;
  const lastName = type === EntryType.CHARACTER
    ? (normalizedNullable(input.lastName) ?? (input.lastName === undefined ? current?.lastName : null))
    : null;
  const honorificInput = input.honorific !== undefined ? input.honorific : input.title;
  const honorific = type === EntryType.CHARACTER
    ? (normalizedNullable(honorificInput) ?? (honorificInput === undefined ? current?.honorific : null))
    : null;
  const searchText = [title, firstName, lastName, honorific, summary, content, ...aliases, ...tags, ...Object.values(infobox)]
    .filter(Boolean)
    .join(" ");

  return {
    id: current?.id,
    slug: createSlug(input.slug || current?.slug || title),
    title,
    firstName,
    lastName,
    honorific,
    type,
    status: input.status ?? current?.status ?? PublicationStatus.PUBLISHED,
    summary,
    content,
    searchText,
    aliases,
    tags,
    infobox: infobox as Prisma.InputJsonValue,
    isFeatured: input.isFeatured ?? current?.isFeatured ?? false,
    imagePath: current?.imagePath ?? null,
    birthYear: input.birthYear !== undefined ? input.birthYear : current?.birthYear ?? null,
    deathYear: input.deathYear !== undefined ? input.deathYear : current?.deathYear ?? null,
    reignStartYear: input.reignStartYear !== undefined ? input.reignStartYear : current?.reignStartYear ?? null,
    reignEndYear: input.reignEndYear !== undefined ? input.reignEndYear : current?.reignEndYear ?? null,
    createdAt: current?.createdAt,
    updatedAt: current?.updatedAt,
  };
}

function validateChronology(type: EntryType, slug: string, data: Prisma.EntryUncheckedCreateInput): void {
  const errors: LoreIssue[] = [];
  if (data.birthYear != null && data.deathYear != null && Number(data.deathYear) < Number(data.birthYear)) {
    errors.push({ entity: type.toLowerCase(), slug, field: "deathYear", message: "deathYear cannot be lower than birthYear" });
  }
  if (data.reignStartYear != null && data.reignEndYear != null && Number(data.reignEndYear) < Number(data.reignStartYear)) {
    errors.push({ entity: type.toLowerCase(), slug, field: "reignEndYear", message: "reignEndYear cannot be lower than reignStartYear" });
  }
  if (errors.length) throw new LoreValidationError(errors);
}

function withoutSystemFields(data: Prisma.EntryUncheckedCreateInput): Prisma.EntryUncheckedUpdateInput {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...update } = data;
  return update;
}

export async function createResource(
  database: DatabaseClient,
  name: ResourceName,
  input: ResourceInput,
  mode: "create" | "upsert" = "create",
): Promise<{ entry: Entry; action: "created" | "updated" }> {
  const type = resourceType(name, input.type);
  if (input.slug) {
    const requestedSlug = createSlug(input.slug);
    const existing = await database.entry.findUnique({ where: { slug: requestedSlug } });
    if (existing) {
      if (mode !== "upsert") throw new HttpError(409, `Slug ${requestedSlug} already exists.`);
      if (existing.type !== type) throw new HttpError(409, `Slug ${requestedSlug} belongs to ${existing.type}, not ${type}.`);
      return { entry: await updateResource(database, name, existing.id, input), action: "updated" };
    }
  }
  const initial = buildData(type, input);
  const slug = String(initial.slug);
  if (!slug) throw new LoreValidationError([{ entity: name, field: "slug", message: "slug cannot be empty" }]);
  const current = await database.entry.findUnique({ where: { slug } });

  if (current) {
    if (mode !== "upsert") throw new HttpError(409, `Slug ${slug} already exists.`);
    if (current.type !== type) throw new HttpError(409, `Slug ${slug} belongs to ${current.type}, not ${type}.`);
    return { entry: await updateResource(database, name, current.id, input), action: "updated" };
  }

  validateChronology(type, slug, initial);
  const created = await database.entry.create({
    data: {
      ...initial,
      revisions: {
        create: {
          title: String(initial.title),
          summary: String(initial.summary),
          content: String(initial.content),
          infobox: initial.infobox as Prisma.InputJsonValue,
          changeNote: input.changeNote || "Utworzenie przez Admin API",
        },
      },
    },
  });
  return { entry: created, action: "created" };
}

export async function updateResource(database: DatabaseClient, name: ResourceName, identifier: string, input: ResourceInput): Promise<Entry> {
  const expectedType = resourceDefinitions[name];
  const current = await resolveEntry(database, identifier, expectedType);
  const type = resourceType(name, input.type ?? current.type);
  const data = buildData(type, input, current);
  const slug = String(data.slug);
  validateChronology(type, slug, data);

  await database.revision.create({
    data: {
      entryId: current.id,
      title: current.title,
      summary: current.summary,
      content: current.content,
      infobox: current.infobox as Prisma.InputJsonValue,
      changeNote: input.changeNote || "Aktualizacja przez Admin API",
    },
  });
  return database.entry.update({ where: { id: current.id }, data: withoutSystemFields(data) });
}

export function serializeResource(entry: Entry): Record<string, unknown> {
  const common = {
    id: entry.id,
    slug: entry.slug,
    type: entry.type,
    status: entry.status,
    displayName: entry.title,
    summary: entry.summary,
    description: entry.content,
    content: entry.content,
    aliases: entry.aliases,
    tags: entry.tags,
    infobox: entry.infobox,
    isFeatured: entry.isFeatured,
    imagePath: entry.imagePath,
    birthYear: entry.birthYear,
    deathYear: entry.deathYear,
    reignStartYear: entry.reignStartYear,
    reignEndYear: entry.reignEndYear,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
  if (entry.type === EntryType.CHARACTER) {
    return { ...common, firstName: entry.firstName, lastName: entry.lastName, title: entry.honorific };
  }
  return { ...common, name: entry.title, title: entry.title };
}

export async function listResources(
  database: DatabaseClient,
  name: ResourceName,
  options: { search?: string; page?: number; limit?: number; includeDrafts?: boolean } = {},
): Promise<{ items: Record<string, unknown>[]; total: number; page: number; pages: number }> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 40));
  const type = resourceDefinitions[name];
  const search = options.search?.trim();
  const where: Prisma.EntryWhereInput = {
    ...(type ? { type } : {}),
    ...(!options.includeDrafts ? { status: PublicationStatus.PUBLISHED } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { aliases: { has: search } },
      ],
    } : {}),
  };
  const [entries, total] = await Promise.all([
    database.entry.findMany({ where, orderBy: [{ isFeatured: "desc" }, { title: "asc" }], skip: (page - 1) * limit, take: limit }),
    database.entry.count({ where }),
  ]);
  return { items: entries.map(serializeResource), total, page, pages: Math.ceil(total / limit) };
}
