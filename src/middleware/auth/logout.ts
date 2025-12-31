/**
 * @packageDocumentation
 * @module middleware/auth/logout
 * @since 1.0.0
 * @author Z-kali
 * @description 登出中间件
 */

import type { Request, Response } from "express";
import { logoutAsync } from "@/services/auth";
import { ok, serverError } from "@/common/response";
import { AuthErrorCode } from "@/tools/jwt";

interface AuthRequest extends Request {
  user?: {
    sub: string;
    [key: string]: any;
  };
}

export function createLogoutMiddleware(): (req: Request, res: Response) => Promise<Response> {
  return async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user?.sub;
      if (!userId) {
         // If called without auth, just return success as "already logged out" state is achieved
         return ok(res, { loggedOut: true }, "Logged out");
      }
      
      await logoutAsync(userId);
      return ok(res, { loggedOut: true }, "Logged out");
    } catch (err) {
      return serverError(res, err, "Logout failed");
    }
  };
}
