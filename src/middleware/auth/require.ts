/**
 * @packageDocumentation
 * @module middleware-auth-require
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 基础认证中间件：验证 Bearer JWT 并注入用户载荷；限制令牌类型为 access
 */

import type { Request, Response, NextFunction } from "express";
import { createJwtServiceFromEnv, Guards, AuthError, AuthErrorCode } from "@/tools/jwt";
import type { JwtService, JwtUserPayload } from "@/tools/jwt";

let _jwt: JwtService | null = null;
const getJwt = (): JwtService => (_jwt ??= createJwtServiceFromEnv());

/**
 * @type AuthRequest
 * @description 扩展请求类型，附加已验证的用户载荷
 * @property {JwtUserPayload} user - JWT 验证后的用户载荷
 */
export type AuthRequest = Request & { user: JwtUserPayload };

/**
 * @function requireAuth
 * @description 验证 `Authorization: Bearer <token>` 并注入 `req.user`
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一中间件回调
 * @returns {void} 无返回值；验证成功后继续执行
 * @throws {AuthError} INVALID/MissingToken 当令牌缺失或非法
 * @example
 * app.use(requireAuth);
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
    if (!token) throw new AuthError(AuthErrorCode.MissingToken, "Missing token", 401);
    getJwt()
      .verifyAsync(token)
      .then((payload) => {
        (req as AuthRequest).user = payload;
        next();
      })
      .catch((e: unknown) => {
        if (e instanceof AuthError) {
          res.status(e.status).json({ code: e.code, message: e.message, status: e.status });
        } else {
          res.status(401).json({ code: AuthErrorCode.Invalid, message: "Unauthorized", status: 401 });
        }
      });
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      res.status(e.status).json({ code: e.code, message: e.message, status: e.status });
    } else {
      res.status(401).json({ code: AuthErrorCode.Invalid, message: "Unauthorized", status: 401 });
    }
  }
}

/**
 * @function requireAccess
 * @description 断言当前请求使用访问令牌（`tokenType === "access"`）
 * @param {Request} req - Express 请求对象（应为 `AuthRequest`）
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一中间件回调
 * @returns {void} 无返回值；断言成功后继续执行
 * @throws {AuthError} Forbidden 当令牌类型不为 access
 * @example
 * router.get("/me", requireAuth, requireAccess, handler);
 */
export function requireAccess(req: Request, res: Response, next: NextFunction): void {
  try {
    const p = (req as AuthRequest).user;
    Guards.assertTokenKind(p, "access");
    next();
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      res.status(e.status).json({ code: e.code, message: e.message, status: e.status });
    } else {
      res.status(403).json({ code: AuthErrorCode.Forbidden, message: "Forbidden", status: 403 });
    }
  }
}
