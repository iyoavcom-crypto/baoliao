import type { Response } from "express";
import { AuthError, AuthErrorCode } from "@/tools/jwt";

export function handleGuardError(res: Response, e: unknown): void {
  if (e instanceof AuthError) {
    res.status(e.status).json({ code: e.code, message: e.message, status: e.status });
    return;
  }
  res.status(403).json({ code: AuthErrorCode.Forbidden, message: "Forbidden", status: 403 });
}

