import type { OpenAPIV3 } from "openapi-types";
import { resourceDefinitions } from "./services/resources.js";

const jsonBody = (schema: string): OpenAPIV3.RequestBodyObject => ({
  required: true,
  content: { "application/json": { schema: { $ref: schema } } },
});

const jsonResponse = (description: string, schema: string): OpenAPIV3.ResponseObject => ({
  description,
  content: { "application/json": { schema: { $ref: schema } } },
});

const resourcePaths: OpenAPIV3.PathsObject = {};
const importCollectionProperties: Record<string, OpenAPIV3.SchemaObject> = {};
for (const resource of Object.keys(resourceDefinitions)) {
  importCollectionProperties[resource] = { type: "array", items: { $ref: "#/components/schemas/ResourceInput" } };
  resourcePaths[`/api/${resource}`] = {
    get: { tags: [resource], summary: `Lista: ${resource}`, parameters: [{ in: "query", name: "search", schema: { type: "string" } }, { in: "query", name: "page", schema: { type: "integer", minimum: 1 } }, { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100 } }], responses: { "200": jsonResponse("Lista wpisów", "#/components/schemas/ResourceList") } },
    post: { tags: [resource], summary: `Utwórz: ${resource}`, security: [{ bearerAuth: [] }], requestBody: jsonBody("#/components/schemas/ResourceInput"), responses: { "201": jsonResponse("Utworzono", "#/components/schemas/Resource"), "400": { $ref: "#/components/responses/ValidationError" }, "401": { $ref: "#/components/responses/Unauthorized" }, "409": { $ref: "#/components/responses/Conflict" } } },
  };
  resourcePaths[`/api/${resource}/{idOrSlug}`] = {
    parameters: [{ in: "path", name: "idOrSlug", required: true, schema: { type: "string" } }],
    get: { tags: [resource], summary: `Pobierz: ${resource}`, responses: { "200": jsonResponse("Wpis", "#/components/schemas/Resource"), "404": { $ref: "#/components/responses/NotFound" } } },
    patch: { tags: [resource], summary: `Aktualizuj: ${resource}`, security: [{ bearerAuth: [] }], requestBody: jsonBody("#/components/schemas/ResourceInput"), responses: { "200": jsonResponse("Zaktualizowano", "#/components/schemas/Resource"), "400": { $ref: "#/components/responses/ValidationError" }, "401": { $ref: "#/components/responses/Unauthorized" }, "404": { $ref: "#/components/responses/NotFound" }, "409": { $ref: "#/components/responses/Conflict" } } },
    delete: { tags: [resource], summary: `Usuń: ${resource}`, security: [{ bearerAuth: [] }], responses: { "204": { description: "Usunięto" }, "401": { $ref: "#/components/responses/Unauthorized" }, "404": { $ref: "#/components/responses/NotFound" } } },
  };
}

function imagePath(summary: string): OpenAPIV3.PathItemObject {
  return {
    parameters: [{ in: "path", name: "idOrSlug", required: true, schema: { type: "string" } }],
    post: {
      tags: ["Images"], summary, security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["image"], properties: { image: { type: "string", format: "binary" } } } } } },
      responses: { "201": { description: "Przesłano" }, "400": { description: "Nieprawidłowy obraz" }, "413": { description: "Plik przekracza 10 MB" } },
    },
    delete: { tags: ["Images"], summary: "Usuń zdjęcie", security: [{ bearerAuth: [] }], responses: { "204": { description: "Usunięto" } } },
  };
}

function characterRelationshipsBody(): OpenAPIV3.RequestBodyObject {
  return {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            father: { type: "string", nullable: true },
            mother: { type: "string", nullable: true },
            siblings: { type: "array", items: { type: "object", properties: { target: { type: "string" }, type: { type: "string", enum: ["sibling", "twin"] } } } },
            spouses: { type: "array", items: { type: "string" } },
            children: { type: "array", items: { type: "string" } },
            predecessor: { type: "string", nullable: true },
            successor: { type: "string", nullable: true },
          },
        },
      },
    },
  };
}

export const openApiDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: { title: "Wiki Imperium Admin API", version: "1.0.0", description: "Wspólne API panelu administracyjnego, importów JSON i skryptów. Odczyt publiczny, zapis chroniony kluczem Bearer." },
  servers: [{ url: "/" }],
  tags: [...Object.keys(resourceDefinitions).map((name) => ({ name })), { name: "Relationships" }, { name: "Import" }, { name: "Images" }],
  paths: {
    ...resourcePaths,
    "/api/relationships": {
      get: { tags: ["Relationships"], summary: "Lista relacji", responses: { "200": { description: "Lista relacji" } } },
      post: { tags: ["Relationships"], summary: "Utwórz relację i jej odwrotność", security: [{ bearerAuth: [] }], requestBody: jsonBody("#/components/schemas/RelationshipInput"), responses: { "201": { description: "Utworzono obie strony relacji" }, "400": { $ref: "#/components/responses/ValidationError" } } },
    },
    "/api/relationships/{id}": {
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
      patch: { tags: ["Relationships"], summary: "Zastąp relację i jej odwrotność", security: [{ bearerAuth: [] }], requestBody: jsonBody("#/components/schemas/RelationshipInput"), responses: { "200": { description: "Zaktualizowano" } } },
      delete: { tags: ["Relationships"], summary: "Usuń relację i jej odwrotność", security: [{ bearerAuth: [] }], responses: { "204": { description: "Usunięto" } } },
    },
    "/api/characters/{idOrSlug}/relationships": {
      parameters: [{ in: "path", name: "idOrSlug", required: true, schema: { type: "string" } }],
      get: { tags: ["Relationships"], summary: "Relacje postaci", responses: { "200": { description: "Relacje wychodzące" } } },
      patch: { tags: ["Relationships"], summary: "Zastąp edytowalny zestaw rodziny i sukcesji", security: [{ bearerAuth: [] }], requestBody: characterRelationshipsBody(), responses: { "200": { description: "Zaktualizowano transakcyjnie" }, "400": { $ref: "#/components/responses/ValidationError" } } },
    },
    "/api/admin/bulk": { post: { tags: ["Import"], summary: "Transakcyjny import create-only", security: [{ bearerAuth: [] }], requestBody: jsonBody("#/components/schemas/Import"), responses: { "201": { description: "Import zakończony" }, "400": { $ref: "#/components/responses/ValidationError" } } } },
    "/api/admin/import": { post: { tags: ["Import"], summary: "Transakcyjny upsert; dryRun wycofuje transakcję", parameters: [{ in: "query", name: "dryRun", schema: { type: "boolean" } }], security: [{ bearerAuth: [] }], requestBody: jsonBody("#/components/schemas/Import"), responses: { "200": { description: "Wynik importu lub dry-run" }, "400": { $ref: "#/components/responses/ValidationError" } } } },
    "/api/characters/{idOrSlug}/image": imagePath("Zdjęcie profilowe postaci"),
    "/api/provinces/{idOrSlug}/image": imagePath("Zdjęcie główne prowincji"),
  },
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "API key", description: "ADMIN_API_KEY z konfiguracji backendu" } },
    schemas: {
      ResourceInput: { type: "object", properties: { slug: { type: "string" }, type: { type: "string" }, firstName: { type: "string", nullable: true }, lastName: { type: "string", nullable: true }, title: { type: "string", nullable: true, description: "Tytuł honorowy postaci; dla innych zasobów nazwa" }, displayName: { type: "string" }, summary: { type: "string", nullable: true }, description: { type: "string", nullable: true }, content: { type: "string", nullable: true }, aliases: { type: "array", items: { type: "string" } }, tags: { type: "array", items: { type: "string" } }, infobox: { type: "object", additionalProperties: true }, isFeatured: { type: "boolean" }, status: { type: "string", enum: ["DRAFT", "PUBLISHED"] }, birthYear: { type: "integer", nullable: true }, deathYear: { type: "integer", nullable: true }, reignStartYear: { type: "integer", nullable: true }, reignEndYear: { type: "integer", nullable: true } }, example: { slug: "octavia-de-la-cruz", firstName: "Octavia", lastName: "de la Cruz", birthYear: 428, deathYear: 548, title: null, description: "Siostra bliźniaczka Octaviana Wielkiego." } },
      Resource: { allOf: [{ $ref: "#/components/schemas/ResourceInput" }, { type: "object", required: ["id", "slug", "type", "status", "displayName"], properties: { id: { type: "string", format: "uuid" }, displayName: { type: "string" }, imagePath: { type: "string", nullable: true }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } }] },
      ResourceList: { type: "object", required: ["items", "total", "page", "pages"], properties: { items: { type: "array", items: { $ref: "#/components/schemas/Resource" } }, total: { type: "integer" }, page: { type: "integer" }, pages: { type: "integer" } } },
      RelationshipInput: { type: "object", required: ["source", "target", "type"], properties: { source: { type: "string", description: "ID lub slug" }, target: { type: "string", description: "ID lub slug" }, type: { type: "string", enum: ["father", "mother", "parent", "child", "sibling", "twin", "spouse", "predecessor", "successor", "other"] }, description: { type: "string" } }, example: { source: "konstancja-de-la-cruz", target: "ignacius-de-la-cruz", type: "father" } },
      Import: { type: "object", properties: { mode: { type: "string", enum: ["create", "upsert"], default: "upsert" }, ...importCollectionProperties, relationships: { type: "array", items: { $ref: "#/components/schemas/RelationshipInput" } } }, additionalProperties: false },
      Error: { type: "object", properties: { valid: { type: "boolean", example: false }, message: { type: "string" }, warnings: { type: "array", items: { type: "object" } }, errors: { type: "array", items: { type: "object", required: ["entity", "message"], properties: { entity: { type: "string" }, slug: { type: "string" }, field: { type: "string" }, message: { type: "string" } } } } } },
    },
    responses: { ValidationError: { description: "Błąd walidacji lore", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }, Unauthorized: { description: "Brak lub nieprawidłowy API key" }, NotFound: { description: "Nie znaleziono zasobu" }, Conflict: { description: "Konflikt unikalnego slugu lub typu zasobu", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } },
  },
};
