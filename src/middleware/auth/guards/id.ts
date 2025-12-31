/**
 * @packageDocumentation
 * @module middleware/auth/guards/id
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 用户ID守卫：要求 JWT 载荷的 `sub` 等于目标用户ID
 */

import type { Request, Response, NextFunction } from "express";
import { Guards, AuthError, AuthErrorCode } from "@/tools/jwt";
import type { AuthRequest } from "../require.js";

/**
 * @function requireUserId
 * @description 创建用户ID校验中间件
 * @param {string} userId - 目标用户ID
 * @returns {(req:Request,res:Response,next:NextFunction)=>void} 用户ID守卫中间件
 * @example
 * router.get("/users/:id", requireAuth, requireAccess, requireUserId(req.params.id), handler)
 */
export function requireUserId(userId: string): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const p = (req as AuthRequest).user;
      Guards.assertUserId(p, userId);
      next();
    } catch (e: unknown) {
      if (e instanceof AuthError) {
        res.status(e.status).json({ code: e.code, message: e.message, status: e.status });
      } else {
        res.status(403).json({ code: AuthErrorCode.Forbidden, message: "Forbidden", status: 403 });
      }
    }
  };
}
