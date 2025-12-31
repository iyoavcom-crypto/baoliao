/**
 * @packageDocumentation
 * @module middleware/auth/guards/team
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 团队守卫：要求用户所属团队在允许列表中
 */

import type { Request, Response, NextFunction } from "express";
import { Guards, AuthError, AuthErrorCode } from "@/tools/jwt";
import type { AuthRequest } from "../require.js";

/**
 * @function requireTeam
 * @description 创建团队校验中间件
 * @param {string[]} teams - 允许的团队ID集合
 * @returns {(req:Request,res:Response,next:NextFunction)=>void} 团队守卫中间件
 */
export function requireTeam(teams: string[]): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const p = (req as AuthRequest).user;
      Guards.assertTeam(p, teams);
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
