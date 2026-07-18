import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken, type AuthTokenPayload } from "../utils/jwt";
import { Errors } from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  if (req.cookies?.token) {
    return req.cookies.token as string;
  }
  return null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return next(Errors.unauthorized("Connexion requise pour accéder à cette ressource."));
  }
  try {
    req.user = verifyAuthToken(token);
    next();
  } catch {
    next(Errors.unauthorized("Session invalide ou expirée."));
  }
}

/** N'échoue jamais : attache l'utilisateur si un jeton valide est présent, sinon continue anonyme. */
export function attachUserIfPresent(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = verifyAuthToken(token);
    } catch {
      /* jeton invalide : on continue en tant qu'invité */
    }
  }
  next();
}

export function requireRole(...roles: AuthTokenPayload["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(Errors.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(Errors.forbidden("Votre rôle ne permet pas cette action."));
    }
    next();
  };
}

export const requireStaff = requireRole(
  "super_admin",
  "admin",
  "employee",
  "practitioner"
);

export const requireAdmin = requireRole("super_admin", "admin");
