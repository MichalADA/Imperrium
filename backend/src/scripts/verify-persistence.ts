import { MediaRole } from "@prisma/client";
import { stat } from "node:fs/promises";
import { prisma } from "../prisma.js";
import { resolveStoredPath } from "../lib/media.js";

const stage = process.argv[2];
const baseUrl = "http://127.0.0.1:3000";
const apiKey = process.env.ADMIN_API_KEY;
const characterSlug = "persistence-smoke-character";
const provinceSlug = "persistence-smoke-province";
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

if (!apiKey) throw new Error("ADMIN_API_KEY is required for persistence verification.");

async function api(path: string, init: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${apiKey}`, ...init.headers } });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${init.method ?? "GET"} ${path}: HTTP ${response.status} ${JSON.stringify(body)}`);
  return body;
}

async function removeIfPresent(resource: "characters" | "provinces", slug: string) {
  const existing = await prisma.entry.findUnique({ where: { slug }, select: { id: true } });
  if (existing) await api(`/api/${resource}/${slug}`, { method: "DELETE" });
}

async function upload(resource: "characters" | "provinces", slug: string) {
  const form = new FormData();
  form.append("image", new Blob([png], { type: "image/png" }), "../../unsafe-name.png");
  return api(`/api/${resource}/${slug}/image`, { method: "POST", body: form });
}

async function prepare() {
  await removeIfPresent("characters", characterSlug);
  await removeIfPresent("provinces", provinceSlug);
  await api("/api/characters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: characterSlug, firstName: "Persistence", lastName: "Character" }) });
  await api("/api/provinces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: provinceSlug, title: "Persistence Province" }) });
  const character = await upload("characters", characterSlug);
  const province = await upload("provinces", provinceSlug);
  if (!character?.imagePath || !province?.imagePath) throw new Error("Upload did not return imagePath.");
  console.log("Persistence check prepared: character and province images uploaded.");
}

async function verify() {
  const entries = await prisma.entry.findMany({ where: { slug: { in: [characterSlug, provinceSlug] } }, include: { media: true } });
  if (entries.length !== 2) throw new Error("Entries did not persist across backend restart.");
  for (const entry of entries) {
    if (!entry.imagePath) throw new Error(`Missing imagePath after restart: ${entry.slug}`);
    const metadata = entry.media.find((item) => item.path === entry.imagePath);
    const expectedRole = entry.slug === characterSlug ? MediaRole.PROFILE : MediaRole.COVER;
    if (!metadata || metadata.role !== expectedRole) throw new Error(`Invalid media metadata after restart: ${entry.slug}`);
    if (!(await stat(resolveStoredPath(entry.imagePath))).isFile()) throw new Error(`Missing uploaded file after restart: ${entry.slug}`);
    const response = await fetch(`${baseUrl}/uploads/${entry.imagePath}`);
    if (!response.ok) throw new Error(`Uploaded file is not served after restart: ${entry.slug}`);
  }
  const paths = entries.map((entry) => entry.imagePath!);
  await removeIfPresent("characters", characterSlug);
  await removeIfPresent("provinces", provinceSlug);
  for (const filePath of paths) {
    try { await stat(resolveStoredPath(filePath)); throw new Error(`Deleted entry left an orphaned upload: ${filePath}`); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
  console.log("Persistence verified: database records and both image files survived restart; cleanup succeeded.");
}

try {
  if (stage === "prepare") await prepare();
  else if (stage === "verify") await verify();
  else throw new Error("Use: verify-persistence prepare|verify");
} finally {
  await prisma.$disconnect();
}
