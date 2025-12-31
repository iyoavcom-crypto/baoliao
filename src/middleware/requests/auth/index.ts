/**
 * @packageDocumentation
 * @module authController
 * @since 1.0.0 (2025-11-26)
 * @description 提供用户注册、登录、退出登录控制器 (src/mcp/controllers/auth.ts)
 */

import type { Request, Response } from "express";
import { ok, fail } from "../crud";
import { getLogger } from "@/tools/logging";

const log = getLogger("auth");

// TODO: 实现认证服务函数
const registerAsync = async (email: string, password: string) => {
  throw new Error("Not implemented");
};

const loginAsync = async (email: string, password: string, deviceId?: string) => {
  throw new Error("Not implemented");
};

const logoutAsync = async (userId: string) => {
  throw new Error("Not implemented");
};

/**
 * @interface JwtRequestUser
 * @description 认证后注入到 req.user 中的 JWT 用户信息
 * @property {string} sub - 用户唯一ID
 */
export interface JwtRequestUser {
  sub: string;
}

/**
 * @interface AuthRequest
 * @description 扩展 Express Request，使其包含 user 字段
 * @property {JwtRequestUser} [user] - JWT 解析后的用户信息（可选）
 */
export interface AuthRequest extends Request {
  user?: JwtRequestUser;
}

/**
 * 扩展 Express 全局定义，使 req.user 类型安全
 */
declare module "express-serve-static-core" {
  interface Request {
    user?: JwtRequestUser;
  }
}

/**
 * @function register
 * @description 用户注册控制器（校验邮箱/密码 → 注册 → 返回201）
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @returns {Promise<void>} 无返回值（写入响应）
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const email = String((req.body?.email ?? "").trim());
  const password = String((req.body?.password ?? "").trim());

  if (!email || !password) {
    fail(res, new Error("缺少邮箱或密码"));
    return;
  }

  try {
    const result = await registerAsync(email, password);
    ok(res, result, "注册成功", 201);
  } catch (e) {
    log.error("register failed", { email });
    fail(res, e);
  }
};

/**
 * @function login
 * @description 用户登录控制器（校验 → 读取设备ID → 登录）
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @returns {Promise<void>} 无返回值
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const email = String((req.body?.email ?? "").trim());
  const password = String((req.body?.password ?? "").trim());

  if (!email || !password) {
    fail(res, new Error("缺少邮箱或密码"));
    return;
  }

  try {
    const deviceId = String((req.headers["x-device-id"] ?? "")).trim() || undefined;
    const result = await loginAsync(email, password, deviceId);
    ok(res, result, "登录成功", 200);
  } catch (e) {
    log.warn("login failed", { email });
    fail(res, e);
  }
};

/**
 * @function logout
 * @description 用户退出控制器（从 req.user.sub 获取用户ID）
 * @param {AuthRequest} req - 扩展后的 Request，包含 user
 * @param {Response} res - Express 响应对象
 * @returns {Promise<void>} 无返回值
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.sub ?? "";
    const result = await logoutAsync(userId);
    ok(res, result, "退出成功", 200);
  } catch (e) {
    log.error("logout failed");
    fail(res, e);
  }
};
