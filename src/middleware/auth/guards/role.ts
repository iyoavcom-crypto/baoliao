/**
 * @packageDocumentation
 * @module middleware/auth/guards/role
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 角色守卫：要求用户角色在允许列表中
 */

import type { Request, Response, NextFunction } from "express";
import { Guards, AuthError, AuthErrorCode } from "@/tools/jwt";
import type { AuthRequest } from "../require.js";

/**
 * @function requireRole
 * @description 创建角色校验中间件
 * @param {string[]} roles - 允许的角色ID集合
 * @returns {(req:Request,res:Response,next:NextFunction)=>void} 角色守卫中间件
 */
export function requireRole(roles: string[]): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const p = (req as AuthRequest).user;
      Guards.assertRole(p, roles);
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
