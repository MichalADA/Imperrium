import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function loadLocalEnv(): Promise<void> {
  try {
    const source = await readFile(resolve(".env"), "utf8");
    for (const rawLine of source.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, "$2");
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

await loadLocalEnv();

const [action, file] = process.argv.slice(2);
if (!file || !["import", "validate"].includes(action)) {
  console.error("Użycie: npm run lore:import <plik.json> lub npm run lore:validate <plik.json>");
  process.exit(2);
}

const apiUrl = (process.env.IMPERIUM_API_URL || "http://localhost:3000").replace(/\/$/, "");
const apiKey = process.env.ADMIN_API_KEY;
if (!apiKey) {
  console.error("Brak ADMIN_API_KEY w środowisku.");
  process.exit(2);
}

let payload: Record<string, unknown>;
try {
  payload = JSON.parse(await readFile(resolve(file), "utf8")) as Record<string, unknown>;
} catch (error) {
  console.error(`Nie udało się odczytać pliku lore: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(2);
}
if (!payload.mode) payload.mode = "upsert";

async function request(dryRun: boolean) {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/api/admin/import${dryRun ? "?dryRun=true" : ""}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error(`Nie udało się połączyć z API ${apiUrl}: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
  const result = await response.json().catch(() => ({ valid: false, errors: [{ entity: "connection", message: `API zwróciło HTTP ${response.status} bez odpowiedzi JSON` }] }));
  console.log(JSON.stringify(result, null, 2));
  if (!response.ok || !result.valid) process.exit(1);
  return result;
}

await request(true);
if (action === "import") {
  console.log("Dry-run poprawny. Rozpoczynam import transakcyjny…");
  await request(false);
}
