import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "../prisma.js";
import { importInputSchema, type ImportInput } from "../schemas/resource.js";
import { applyLoreImport } from "../services/import-lore.js";

const importDir = process.env.LORE_IMPORT_DIR?.trim();

type LoreFileImport = {
  file: string;
  payload: ImportInput;
};

async function loadImports(directory: string): Promise<LoreFileImport[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "pl"));

  const imports: LoreFileImport[] = [];

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const raw = await readFile(fullPath, "utf8");
    const json = JSON.parse(raw) as unknown;
    const parsed = importInputSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "request"}: ${issue.message}`)
        .join("; ");
      throw new Error(`Nieprawidłowy plik lore ${file}: ${details}`);
    }

    imports.push({ file, payload: parsed.data });
  }

  return imports;
}

try {
  if (!importDir) {
    console.log("LORE_IMPORT_DIR nie ustawiono — pomijam automatyczny import lore.");
  } else {
    let imports: LoreFileImport[] = [];

    try {
      imports = await loadImports(importDir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        console.log(`Katalog lore ${importDir} nie istnieje — pomijam automatyczny import.`);
      } else {
        throw error;
      }
    }

    if (imports.length === 0) {
      console.log("Brak plików JSON do automatycznego importu lore.");
    } else {
      const summaries = await prisma.$transaction(async (transaction) => {
        const results: Array<{ file: string; summary: Awaited<ReturnType<typeof applyLoreImport>> }> = [];

        for (const item of imports) {
          const summary = await applyLoreImport(transaction, item.payload, item.payload.mode);
          results.push({ file: item.file, summary });
        }

        return results;
      });

      for (const result of summaries) {
        console.log(`Lore import: ${result.file}`, result.summary);
      }

      console.log(`Automatyczny import lore zakończony: ${summaries.length} plików.`);
    }
  }
} finally {
  await prisma.$disconnect();
}
