/**
 * @packageDocumentation
 * @module auth-middlewares
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 提供基于 JWT 的认证与授权中间件：登录、注册、访问控制、角色、权限与 VIP 校验
 */

import type { Request, Response, NextFunction } from "express";
import { createJwtServiceFromEnv, Guards, AuthError, AuthErrorCode } from "@/tools/jwt";
import type { JwtService } from "@/tools/jwt";
import type { JwtUserPayload } from "@/tools/jwt";
import type { TokenKind } from "@/tools/jwt";
import { User } from "@/models";  
import { randomUUID } from "node:crypto";

/**
 * @description 进程级缓存的 JwtService 实例，避免重复初始化
 * @private
 */
let _jwt: ReturnType<typeof createJwtServiceFromEnv> | null = null;

/**
 * @function getJwt
 * @description 懒加载并复用基于环境变量配置的 JwtService 实例
 * @returns {JwtService} 共享的 JwtService 实例
 */
const getJwt = (): JwtService => (_jwt ??= createJwtServiceFromEnv());

/**
 * @type AuthRequest
 * @description 带已验证用户载荷的请求对象
 * @property {JwtUserPayload} user - 已验证的 JWT 用户载荷
 */
type AuthRequest = Request & { user: JwtUserPayload };

/**
 * @function requireAuth
 * @description
 * 校验 `Authorization` 头中的 Bearer JWT：
 * - 成功时解析 payload 并挂载到 `req.user`
 * - 失败时返回对应的认证错误
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - Express 下一中间件回调
 * @returns {void} 无返回值，通过 `next` 传递执行权或直接返回响应
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
 * @description
 * 校验当前请求中的用户令牌类型是否为访问令牌（`access`）：
 * - 成功时继续后续处理
 * - 失败时返回对应的认证或授权错误
 * @param {Request} req - Express 请求对象（应为 `AuthRequest`）
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - Express 下一中间件回调
 * @returns {void} 无返回值，通过 `next` 传递执行权或直接返回响应
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

/**
 * @function requireRole
 * @description
 * 创建角色校验中间件，要求当前用户角色在指定角色列表中：
 * - 成功时继续后续处理
 * - 失败时返回对应的授权错误
 * @param {string[]} roles - 允许访问的角色 ID 或标识列表
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express 角色校验中间件
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

/**
 * @function requireScopes
 * @description
 * 创建权限范围（scope）校验中间件，要求当前用户具备全部指定的 scope：
 * - 成功时继续后续处理
 * - 失败时返回对应的授权错误
 * @param {string[]} required - 访问当前资源所需的 scope 列表
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express scope 校验中间件
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

/**
 * @function requireVip
 * @description
 * 校验当前用户是否为 VIP：
 * - 成功时继续后续处理
 * - 失败时返回对应的授权错误
 * @param {Request} req - Express 请求对象（应为 `AuthRequest`）
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - Express 下一中间件回调
 * @returns {void} 无返回值，通过 `next` 传递执行权或直接返回响应
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

/**
 * @type UserRecord
 * @description 认证与授权流程所需的用户基础信息
 * @property {string} id - 用户唯一标识
 * @property {string} [code] - 用户业务编码或工号
 * @property {string} [roleId] - 用户角色 ID
 * @property {string} [teamId] - 用户所在团队 ID
 * @property {string[]} [scope] - 用户拥有的权限范围列表
 * @property {boolean} [vip] - 是否为 VIP 用户
 * @property {string} [status] - 用户状态，如启用、禁用等
 * @property {string} passwordHash - 存储在数据库中的密码哈希值
 */
type UserLike = {
  id: string;
  roleId: string;
  code?: string | null;
  teamId?: string | null;
  scope?: string[];
  vip: boolean;
};

const toUserLike = (u: User): UserLike => ({
  id: u.id,
  roleId: u.roleId,
  code: null,
  vip: Boolean(u.vip),
});

const toPayloadBase = (u: UserLike, deviceId?: string) => ({
  sub: u.id,
  roleId: u.roleId,
  vip: u.vip,
  ...(u.code !== undefined ? { code: u.code } : {}),
  ...(u.teamId !== undefined ? { teamId: u.teamId } : {}),
  ...(u.scope !== undefined ? { scope: u.scope } : {}),
  ...(deviceId ? { deviceId } : {}),
});

/**
 * @function createLoginMiddleware
 * @description 创建登录处理器中间件，实现基于身份标识与密码的认证：
- 支持 identity/username/email 三种字段名作为登录标识
- 使用密码校验与可选的哈希升级（rehash）逻辑
- 登录成功后颁发 access/refresh 两种 JWT 令牌并返回 payload
 * @returns {(req: Request, res: Response) => Promise<Response>} 登录处理器中间件（用于 Express 路由）
 */
export function createLoginMiddleware(): (req: Request, res: Response) => Promise<Response> {
  return async (req: Request, res: Response) => {
    const identity = String((req.body?.identity ?? req.body?.username ?? req.body?.email ?? "").trim());
    const password = String((req.body?.password ?? "").trim());
    if (!identity || !password) {
      return res.status(400).json({ code: AuthErrorCode.Malformed, message: "Missing identity or password", status: 400 });
    }
    try {
      const user = await User.authenticate(identity, password);
      const deviceId = String((req.headers["x-device-id"] ?? "")).trim() || undefined;
      const base = toPayloadBase(toUserLike(user), deviceId);
      const jwt = getJwt();
      const accessPayload: JwtUserPayload = { ...base, tokenType: "access" as TokenKind };
      const refreshPayload: JwtUserPayload = { ...base, tokenType: "refresh" as TokenKind };
      const access = await jwt.signAsync("access", accessPayload);
      const refresh = await jwt.signAsync("refresh", refreshPayload);
      return res.status(200).json({ access, refresh, payload: base });
    } catch (e: unknown) {
      return res.status(401).json({ code: AuthErrorCode.PasswordMismatch, message: "Password mismatch", status: 401 });
    }
  };
}

/**
 * @function createRegisterMiddleware
 * @description 创建注册处理器中间件，实现新用户注册与首轮令牌颁发：
- 接收 identity/username/email 与密码
- 对密码进行哈希后创建用户
- 创建成功后颁发 access/refresh 两种 JWT 令牌
 * @returns {(req: Request, res: Response) => Promise<Response>} 注册处理器中间件（用于 Express 路由）
 */
export function createRegisterMiddleware(): (req: Request, res: Response) => Promise<Response> {
  return async (req: Request, res: Response) => {
    const identity = String((req.body?.identity ?? req.body?.username ?? req.body?.email ?? "").trim());
    const password = String((req.body?.password ?? "").trim());
    if (!identity || !password) {
      return res.status(400).json({ code: AuthErrorCode.Malformed, message: "Missing identity or password", status: 400 });
    }
    try {
      const user = await User.create({ id: randomUUID(), phone: identity, password, type: "user", vip: false });
      const jwt = getJwt();
      const base = toPayloadBase(toUserLike(user));
      const accessPayload: JwtUserPayload = { ...base, tokenType: "access" as TokenKind };
      const refreshPayload: JwtUserPayload = { ...base, tokenType: "refresh" as TokenKind };
      const access = await jwt.signAsync("access", accessPayload);
      const refresh = await jwt.signAsync("refresh", refreshPayload);
      return res.status(201).json({ access, refresh, payload: base });
    } catch (e: unknown) {
      return res.status(400).json({ code: AuthErrorCode.Malformed, message: "Register failed", status: 400 });
    }
  };
}
