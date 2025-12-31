/**
 * @packageDocumentation
 * @module middleware/auth/login
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 登录中间件：邮箱+密码认证（含透明升级），成功后统一签发 access/refresh
 */

import type { Request, Response } from "express";
import { AuthErrorCode } from "@/tools/jwt";
import { User } from "@/models";
import { issueTokens } from "./tokens.js";

/**
 * @function createLoginMiddleware
 * @description 创建登录处理器；校验邮箱与密码后签发令牌
 * @returns {(req: Request, res: Response) => Promise<Response>} Express 中间件函数
 * @example router.post("/auth/login", createLoginMiddleware());
 */
export function createLoginMiddleware(): (req: Request, res: Response) => Promise<Response> {
  return async (req: Request, res: Response) => {
    const phone = String((req.body?.phone ?? "").trim());
    const password = String((req.body?.password ?? "").trim());
    if (!phone || !password) {
      return res.status(400).json({ code: AuthErrorCode.Malformed, message: "Missing phone or password", status: 400 });
    }
    try {
      const user = await User.authenticate(phone, password);
      const deviceId = String((req.headers["x-device-id"] ?? "")).trim() || undefined;
      const { access, refresh, payload } = await issueTokens(user, deviceId);
      return res.status(200).json({ access, refresh, payload });
    } catch {
      return res.status(401).json({ code: AuthErrorCode.PasswordMismatch, message: "Password mismatch", status: 401 });
    }
  };
}
