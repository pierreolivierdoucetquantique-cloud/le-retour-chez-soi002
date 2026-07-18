import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type UserRole =
  | "super_admin"
  | "admin"
  | "employee"
  | "practitioner"
  | "client"
  | "guest";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}
