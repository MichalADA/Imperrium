import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import path from "node:path";
import { after, before, test } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { UPLOAD_DIRECTORY } from "../lib/media.js";
import { prisma } from "../prisma.js";

process.env.NODE_ENV = "test";
process.env.ADMIN_API_KEY = "integration-secret";
const app = createApp();
const auth = { Authorization: "Bearer integration-secret" };
const marker = `api-test-${Date.now()}`;
const slug = (name: string) => `${marker}-${name}`;

async function createCharacter(name: string) {
  const response = await request(app).post("/api/characters").set(auth).send({ slug: slug(name), firstName: name, description: "Test integracyjny" });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  return response.body;
}

before(async () => { await prisma.$connect(); });
after(async () => {
  await prisma.entry.deleteMany({ where: { slug: { startsWith: marker } } });
  await prisma.$disconnect();
});

test("Admin API: relacje, import, rollback, upsert i dry-run", async (suite) => {
  const father = await createCharacter("father");
  const child = await createCharacter("child");
  const sibling = await createCharacter("sibling");
  const spouse = await createCharacter("spouse");
  const ruler = await createCharacter("ruler");

  await suite.test("dodanie ojca automatycznie dodaje dziecko", async () => {
    const created = await request(app).post("/api/relationships").set(auth).send({ source: child.slug, target: father.slug, type: "father" });
    assert.equal(created.status, 201);
    assert.equal(created.body.inverse.type, "child");
    const fatherRelations = await request(app).get(`/api/characters/${father.slug}/relationships`);
    assert.ok(fatherRelations.body.relationships.some((item: { type: string; target: { slug: string } }) => item.type === "child" && item.target.slug === child.slug));
  });

  await suite.test("usunięcie relacji usuwa odwrotność", async () => {
    const rows = await request(app).get(`/api/characters/${child.slug}/relationships`);
    const relation = rows.body.relationships.find((item: { type: string }) => item.type === "father");
    assert.equal((await request(app).delete(`/api/relationships/${relation.id}`).set(auth)).status, 204);
    const reverse = await request(app).get(`/api/characters/${father.slug}/relationships`);
    assert.ok(!reverse.body.relationships.some((item: { type: string; target: { slug: string } }) => item.type === "child" && item.target.slug === child.slug));
  });

  for (const type of ["sibling", "twin", "spouse"] as const) {
    await suite.test(`${type} jest relacją symetryczną`, async () => {
      const target = type === "spouse" ? spouse : sibling;
      const created = await request(app).post("/api/relationships").set(auth).send({ source: child.slug, target: target.slug, type });
      assert.ok([200, 201].includes(created.status));
      assert.equal(created.body.inverse.type, type);
    });
  }

  await suite.test("predecessor/successor są odwrotne i nie tworzą child", async () => {
    const created = await request(app).post("/api/relationships").set(auth).send({ source: ruler.slug, target: father.slug, type: "predecessor" });
    assert.equal(created.body.inverse.type, "successor");
    const rows = await request(app).get(`/api/characters/${father.slug}/relationships`);
    assert.ok(rows.body.relationships.some((item: { type: string; target: { slug: string } }) => item.type === "successor" && item.target.slug === ruler.slug));
    assert.ok(!rows.body.relationships.some((item: { type: string; target: { slug: string } }) => item.type === "child" && item.target.slug === ruler.slug));
  });

  await suite.test("walidacja blokuje pętlę parent-child i relację z samym sobą", async () => {
    const parent = await request(app).post("/api/relationships").set(auth).send({ source: child.slug, target: father.slug, type: "father" });
    assert.ok([200, 201].includes(parent.status));
    const cycle = await request(app).post("/api/relationships").set(auth).send({ source: father.slug, target: child.slug, type: "father" });
    assert.equal(cycle.status, 400);
    assert.equal(cycle.body.valid, false);
    const self = await request(app).post("/api/relationships").set(auth).send({ source: child.slug, target: child.slug, type: "sibling" });
    assert.equal(self.status, 400);
  });

  await suite.test("bulk import tworzy wiele danych", async () => {
    const response = await request(app).post("/api/admin/bulk").set(auth).send({ characters: [{ slug: slug("bulk-a"), firstName: "Bulk A" }, { slug: slug("bulk-b"), firstName: "Bulk B" }], relationships: [{ source: slug("bulk-a"), target: slug("bulk-b"), type: "sibling" }] });
    assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.equal(response.body.summary.charactersCreated, 2);
    assert.equal(response.body.summary.relationshipsCreated, 2);
  });

  await suite.test("błąd bulk wycofuje całą transakcję", async () => {
    const doomed = slug("rollback");
    const response = await request(app).post("/api/admin/bulk").set(auth).send({ characters: [{ slug: doomed, firstName: "Rollback" }], relationships: [{ source: doomed, target: "slug-ktory-nie-istnieje", type: "sibling" }] });
    assert.equal(response.status, 400);
    assert.equal(response.body.valid, false);
    assert.equal(await prisma.entry.count({ where: { slug: doomed } }), 0);
  });

  await suite.test("upsert aktualizuje istniejący slug", async () => {
    const target = slug("upsert");
    await request(app).post("/api/admin/import").set(auth).send({ mode: "upsert", characters: [{ slug: target, firstName: "Przed" }] });
    const response = await request(app).post("/api/admin/import").set(auth).send({ mode: "upsert", characters: [{ slug: target, firstName: "Po" }] });
    assert.equal(response.status, 200);
    assert.equal(response.body.summary.charactersUpdated, 1);
    assert.equal((await prisma.entry.findUnique({ where: { slug: target } }))?.title, "Po");
  });

  await suite.test("dry-run waliduje, ale nie zapisuje", async () => {
    const target = slug("dry-run");
    const response = await request(app).post("/api/admin/import?dryRun=true").set(auth).send({ mode: "upsert", characters: [{ slug: target, firstName: "Dry Run" }] });
    assert.equal(response.status, 200);
    assert.equal(response.body.dryRun, true);
    assert.equal(response.body.summary.charactersCreated, 1);
    assert.equal(await prisma.entry.count({ where: { slug: target } }), 0);
  });

  await suite.test("dry-run zwraca slug i pole błędnej chronologii", async () => {
    const target = slug("invalid-dates");
    const response = await request(app).post("/api/admin/import?dryRun=true").set(auth).send({ mode: "upsert", characters: [{ slug: target, firstName: "Chronologia", birthYear: 50, deathYear: 40 }] });
    assert.equal(response.status, 400);
    assert.equal(response.body.valid, false);
    assert.equal(response.body.errors[0].slug, target);
    assert.equal(response.body.errors[0].field, "deathYear");
    assert.equal(await prisma.entry.count({ where: { slug: target } }), 0);
  });

  await suite.test("upload postaci i prowincji zapisuje bezpieczny plik dostępny po odtworzeniu aplikacji", async () => {
    const imageCharacter = await createCharacter("image-character");
    const provinceResponse = await request(app).post("/api/provinces").set(auth).send({ slug: slug("image-province"), title: "Prowincja testowa" });
    assert.equal(provinceResponse.status, 201, JSON.stringify(provinceResponse.body));
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

    const characterUpload = await request(app).post(`/api/characters/${imageCharacter.slug}/image`).set(auth).attach("image", png, { filename: "../../avatar.png", contentType: "image/png" });
    assert.equal(characterUpload.status, 201, JSON.stringify(characterUpload.body));
    assert.match(characterUpload.body.imagePath, /^[0-9a-f-]{36}\.png$/);
    assert.equal((await stat(path.join(UPLOAD_DIRECTORY, characterUpload.body.imagePath))).size, png.length);

    const provinceUpload = await request(app).post(`/api/provinces/${provinceResponse.body.slug}/image`).set(auth).attach("image", png, { filename: "cover.png", contentType: "image/png" });
    assert.equal(provinceUpload.status, 201, JSON.stringify(provinceUpload.body));
    const recreatedApp = createApp();
    assert.equal((await request(recreatedApp).get(characterUpload.body.imageUrl)).status, 200);
    assert.equal((await request(recreatedApp).get(provinceUpload.body.imageUrl)).status, 200);

    assert.equal((await request(app).delete(`/api/characters/${imageCharacter.slug}`).set(auth)).status, 204);
    assert.equal((await request(app).delete(`/api/provinces/${provinceResponse.body.slug}`).set(auth)).status, 204);
  });
});
