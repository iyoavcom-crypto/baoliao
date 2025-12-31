/**
 * @packageDocumentation
 * @module middleware/auth/guards/scopes
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 作用域守卫：要求用户具备指定的权限范围
 */

import type { Request, Response, NextFunction } from "express";
import { Guards, AuthError, AuthErrorCode } from "@/tools/jwt";
import type { AuthRequest } from "../require.js";

/**
 * @function requireScopes
 * @description 创建作用域校验中间件
 * @param {string[]} required - 所需的作用域列表
 * @returns {(req:Request,res:Response,next:NextFunction)=>void} 作用域守卫中间件
 */
export function requireScopes(required: string[]): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const p = (req as AuthRequest).user;
      Guards.assertScopes(p, required);
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
