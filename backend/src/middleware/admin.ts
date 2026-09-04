import type { NextFunction, Request, Response } from "express";

export function hasAdminAccess(request: Request): boolean {
  const configuredToken = process.env.ADMIN_API_KEY?.trim();
  if (!configuredToken) return false;
  const authorization = request.header("authorization") || "";
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  return bearer === configuredToken;
}

export function requireAdmin(request: Request, response: Response, next: NextFunction): void {
  if (!process.env.ADMIN_API_KEY?.trim()) {
    response.status(503).json({ message: "Admin API jest wyłączone: ustaw ADMIN_API_KEY." });
    return;
  }
  if (!hasAdminAccess(request)) {
    response.setHeader("WWW-Authenticate", "Bearer");
    response.status(401).json({ message: "Brak lub nieprawidłowy klucz API administratora." });
    return;
  }
  next();
}
