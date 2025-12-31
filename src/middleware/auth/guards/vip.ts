/**
 * @packageDocumentation
 * @module middleware/auth/guards/vip
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description VIP 守卫：要求用户为 VIP
 */

import type { Request, Response, NextFunction } from "express";
import { Guards, AuthError, AuthErrorCode } from "@/tools/jwt";
import type { AuthRequest } from "../require.js";

/**
 * @function requireVip
 * @description 校验用户是否为 VIP
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一中间件回调
 * @returns {void} 无返回值；通过或拒绝请求
 */
export function requireVip(req: Request, res: Response, next: NextFunction): void {
  try {
    const p = (req as AuthRequest).user;
    Guards.assertVip(p);
    next();
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      res.status(e.status).json({ code: e.code, message: e.message, status: e.status });
    } else {
      res.status(403).json({ code: AuthErrorCode.Forbidden, message: "Forbidden", status: 403 });
    }
  }
}
