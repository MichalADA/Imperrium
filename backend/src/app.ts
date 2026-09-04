import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import { HttpError, LoreValidationError } from "./lib/http-error.js";
import { ImageValidationError, UPLOAD_DIRECTORY } from "./lib/media.js";
import { prisma } from "./prisma.js";
import { openApiDocument } from "./openapi.js";
import { adminRouter } from "./routes/admin.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { entriesRouter } from "./routes/entries.js";
import { mediaRouter } from "./routes/media.js";
import { relationshipsRouter } from "./routes/relationships.js";
import { apiValidationError, resourceRouter } from "./routes/resources.js";
import { searchRouter } from "./routes/search.js";
import { timelineRouter } from "./routes/timeline.js";
import { resourceDefinitions, type ResourceName } from "./services/resources.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: false }));
  const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean);
  app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
  app.use(express.json({ limit: "2mb" }));
  if (process.env.NODE_ENV !== "test") app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use("/uploads", express.static(UPLOAD_DIRECTORY, { dotfiles: "deny", fallthrough: false, index: false, maxAge: "7d" }));

  app.get("/health/live", (_request, response) => response.json({ status: "ok" }));
  app.get("/health/ready", async (_request, response) => {
    try { await prisma.$queryRaw`SELECT 1`; response.json({ status: "ok", database: "connected" }); }
    catch { response.status(503).json({ status: "error", database: "unavailable" }); }
  });
  app.get("/api/openapi.json", (_request, response) => response.json(openApiDocument));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, { customSiteTitle: "Wiki Imperium API" }));

  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/entries", mediaRouter);
  app.use("/api/entries", entriesRouter);
  for (const resource of Object.keys(resourceDefinitions) as ResourceName[]) {
    if (resource === "characters" || resource === "provinces") app.use(`/api/${resource}`, mediaRouter);
    app.use(`/api/${resource}`, resourceRouter(resource));
  }
  app.use("/api/relationships", relationshipsRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/timeline", timelineRouter);

  app.use((_request, response) => response.status(404).json({ message: "Nie znaleziono zasobu." }));
  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof multer.MulterError) {
      response.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Zdjęcie przekracza limit 10 MB." : "Nieprawidłowy plik uploadu." }); return;
    }
    if (error instanceof ImageValidationError) { response.status(400).json({ message: error.message }); return; }
    const parsed = apiValidationError(error);
    if (parsed) { response.status(parsed.status).json(parsed.body); return; }
    if (error instanceof LoreValidationError) { response.status(400).json({ valid: false, warnings: error.warnings, errors: error.errors }); return; }
    if (error instanceof HttpError) { response.status(error.status).json({ message: error.message, ...(error.details ? { details: error.details } : {}) }); return; }
    console.error(error);
    response.status(500).json({ message: "Wewnętrzny błąd serwera." });
  };
  app.use(errorHandler);
  return app;
}
