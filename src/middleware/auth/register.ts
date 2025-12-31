/**
 * @packageDocumentation
 * @module middleware/auth/register
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 注册中间件：邮箱+密码创建用户（模型钩子哈希与 PIN），成功后统一签发 access/refresh
 */

import type { Request, Response } from "express";
import { AuthErrorCode } from "@/tools/jwt";
import { User, Role } from "@/models";
import { randomUUID } from "node:crypto";
import { issueTokens } from "./tokens.js";
import { UniqueConstraintError, ValidationError } from "sequelize";

/**
 * @function createRegisterMiddleware
 * @description 创建注册处理器；校验邮箱与密码并创建用户，成功后签发令牌
 * @returns {(req: Request, res: Response) => Promise<Response>} Express 中间件函数
 * @example router.post("/auth/register", createRegisterMiddleware());
 */
export function createRegisterMiddleware(): (req: Request, res: Response) => Promise<Response> {
  return async (req: Request, res: Response) => {
    const phone = String((req.body?.phone ?? "").trim());
    const password = String((req.body?.password ?? "").trim());
    if (!phone || !password) {
      return res.status(400).json({ code: AuthErrorCode.Malformed, message: "Missing phone or password", status: 400 });
    }
    try {
      // 确保默认角色存在（使用 findOrCreate 避免并发问题）
      const [defaultRole] = await Role.findOrCreate({
        where: { id: "user" },
        defaults: { id: "user", name: "user", group: "user" as any }
      });
      
      const user = await User.create({ 
        id: randomUUID(), 
        phone, 
        password, 
        type: "user",
        vip: false,
        roleId: defaultRole.id
      });
      const { access, refresh, payload } = await issueTokens(user);
      return res.status(201).json({ access, refresh, payload });
    } catch (e: unknown) {
      console.error("DEBUG: Register caught error:", e);
      if (e instanceof UniqueConstraintError) {
        return res.status(409).json({ code: "PHONE_EXISTS", message: "Phone already exists", status: 409 });
      }
      if (e instanceof ValidationError) {
        console.error("Register Validation Error:", e);
        return res.status(400).json({ 
          code: AuthErrorCode.Malformed, 
          message: "Invalid phone or password", 
          status: 400,
          errors: e.errors 
        });
      }
      return res.status(400).json({ code: AuthErrorCode.Malformed, message: "Register failed", status: 400 });
    }
  };
}
