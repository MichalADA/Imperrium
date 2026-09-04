import { EntryType, type Relation } from "@prisma/client";
import { HttpError, LoreValidationError } from "../lib/http-error.js";
import type { CharacterRelationshipsInput, RelationshipInput, RelationshipType } from "../schemas/resource.js";
import { resolveEntry, type DatabaseClient } from "./resources.js";

const inverseTypes: Record<RelationshipType, RelationshipType> = {
  father: "child",
  mother: "child",
  parent: "child",
  child: "parent",
  sibling: "sibling",
  twin: "twin",
  spouse: "spouse",
  predecessor: "successor",
  successor: "predecessor",
  other: "other",
};

const familyTypes = new Set<RelationshipType>(["father", "mother", "parent", "child", "sibling", "twin", "spouse"]);
const managedTypes = new Set<RelationshipType>([...familyTypes, "predecessor", "successor"]);

function isRelationshipType(value: string): value is RelationshipType {
  return value in inverseTypes;
}

async function assertNoParentCycle(database: DatabaseClient, sourceId: string, targetId: string, type: RelationshipType): Promise<void> {
  if (!["father", "mother", "parent", "child"].includes(type)) return;
  const parentId = type === "child" ? sourceId : targetId;
  const childId = type === "child" ? targetId : sourceId;
  const rows = await database.relation.findMany({
    where: { type: { in: ["father", "mother", "parent", "child"] } },
    select: { sourceId: true, targetId: true, type: true },
  });
  const childrenByParent = new Map<string, Set<string>>();
  const add = (parent: string, child: string) => {
    const values = childrenByParent.get(parent) ?? new Set<string>();
    values.add(child);
    childrenByParent.set(parent, values);
  };
  for (const row of rows) {
    if (row.type === "child") add(row.sourceId, row.targetId);
    else add(row.targetId, row.sourceId);
  }
  add(parentId, childId);
  const queue = [childId];
  const visited = new Set<string>();
  while (queue.length) {
    const current = queue.shift()!;
    if (current === parentId) {
      throw new LoreValidationError([{ entity: "relationship", field: "type", message: "parent-child relation would create a cycle" }]);
    }
    if (visited.has(current)) continue;
    visited.add(current);
    queue.push(...(childrenByParent.get(current) ?? []));
  }
}

function inverseCandidates(type: string): string[] {
  if (type === "child") return ["father", "mother", "parent"];
  return isRelationshipType(type) ? [inverseTypes[type]] : [];
}

async function resolveRelationshipEntry(database: DatabaseClient, identifier: string, field: "source" | "target") {
  try {
    return await resolveEntry(database, identifier);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      throw new LoreValidationError([{ entity: "relationship", field, message: `${field} does not reference an existing entry: ${identifier}` }]);
    }
    throw error;
  }
}

export async function createRelationship(database: DatabaseClient, input: RelationshipInput): Promise<{ relation: Relation; inverse: Relation; created: boolean; inverseCreated: boolean; rowsCreated: number }> {
  const source = await resolveRelationshipEntry(database, input.source, "source");
  const target = await resolveRelationshipEntry(database, input.target, "target");
  if (source.id === target.id) {
    throw new LoreValidationError([{ entity: "relationship", field: "target", message: "a character cannot be related to itself" }]);
  }
  if ((familyTypes.has(input.type) || input.type === "predecessor" || input.type === "successor") &&
      (source.type !== EntryType.CHARACTER || target.type !== EntryType.CHARACTER)) {
    throw new LoreValidationError([{ entity: "relationship", field: "type", message: `${input.type} requires two characters` }]);
  }
  await assertNoParentCycle(database, source.id, target.id, input.type);
  const previous = await database.relation.findUnique({
    where: { sourceId_targetId_type: { sourceId: source.id, targetId: target.id, type: input.type } },
  });
  const inverseType = inverseTypes[input.type];
  const previousInverse = await database.relation.findUnique({
    where: { sourceId_targetId_type: { sourceId: target.id, targetId: source.id, type: inverseType } },
  });
  const description = input.description ?? "";
  const descriptionUpdate = input.description === undefined ? {} : { description: input.description };
  const relation = await database.relation.upsert({
    where: { sourceId_targetId_type: { sourceId: source.id, targetId: target.id, type: input.type } },
    create: { sourceId: source.id, targetId: target.id, type: input.type, description, isTwin: input.type === "twin" },
    update: { ...descriptionUpdate, isTwin: input.type === "twin" },
  });
  const inverse = await database.relation.upsert({
    where: { sourceId_targetId_type: { sourceId: target.id, targetId: source.id, type: inverseType } },
    create: { sourceId: target.id, targetId: source.id, type: inverseType, description, isTwin: input.type === "twin" },
    update: { ...descriptionUpdate, isTwin: input.type === "twin" },
  });
  const created = !previous;
  const inverseCreated = !previousInverse;
  return { relation, inverse, created, inverseCreated, rowsCreated: Number(created) + Number(inverseCreated) };
}

export async function deleteRelationship(database: DatabaseClient, id: string): Promise<void> {
  const relation = await database.relation.findUnique({ where: { id } });
  if (!relation) throw new HttpError(404, "Nie znaleziono relacji.");
  await database.relation.deleteMany({
    where: {
      OR: [
        { id: relation.id },
        { sourceId: relation.targetId, targetId: relation.sourceId, type: { in: inverseCandidates(relation.type) } },
      ],
    },
  });
}

export async function replaceCharacterRelationships(
  database: DatabaseClient,
  identifier: string,
  input: CharacterRelationshipsInput,
): Promise<void> {
  const character = await resolveEntry(database, identifier, EntryType.CHARACTER);
  const desired: RelationshipInput[] = [];
  if (input.father) desired.push({ source: character.id, target: input.father, type: "father" });
  if (input.mother) desired.push({ source: character.id, target: input.mother, type: "mother" });
  for (const target of input.parents) desired.push({ source: character.id, target, type: "parent" });
  for (const sibling of input.siblings) desired.push({ source: character.id, target: sibling.target, type: sibling.type });
  for (const target of input.spouses) desired.push({ source: character.id, target, type: "spouse" });
  for (const target of input.children) desired.push({ source: character.id, target, type: "child" });
  if (input.predecessor) desired.push({ source: character.id, target: input.predecessor, type: "predecessor" });
  if (input.successor) desired.push({ source: character.id, target: input.successor, type: "successor" });

  const resolved = [] as Array<RelationshipInput & { targetId: string }>;
  for (const item of desired) {
    const target = await resolveEntry(database, item.target, EntryType.CHARACTER);
    resolved.push({ ...item, targetId: target.id });
  }
  const keys = new Set(resolved.map((item) => `${item.targetId}:${item.type}`));
  const current = await database.relation.findMany({ where: { sourceId: character.id, type: { in: [...managedTypes] } } });
  for (const relation of current) {
    if (!keys.has(`${relation.targetId}:${relation.type}`)) await deleteRelationship(database, relation.id);
  }
  for (const item of resolved) await createRelationship(database, item);
}

export async function getCharacterRelationships(database: DatabaseClient, identifier: string) {
  const character = await resolveEntry(database, identifier, EntryType.CHARACTER);
  return database.relation.findMany({
    where: { sourceId: character.id },
    include: { target: { select: { id: true, slug: true, title: true, type: true, imagePath: true } } },
    orderBy: [{ type: "asc" }, { target: { title: "asc" } }],
  });
}
