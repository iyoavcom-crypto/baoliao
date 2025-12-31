/**
 * @packageDocumentation
 * @module services/auth/token
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description Token 认证服务，提供 JWT Token 解析和验证功能
 */

import { createJwtServiceFromEnv } from "../../tools/jwt/index.js";
import type { JwtUserPayload } from "../../tools/jwt/index.js";

/**
 * JWT 服务实例（单例）
 */
const jwtService = createJwtServiceFromEnv();

/**
 * @function parseBearer
 * @description 从 Authorization 头中提取 Bearer Token
 * @param {string | undefined} authHeader - Authorization 头部值
 * @returns {string | null} 提取的 Token，格式无效返回 null
 * 
 * @example
 * const token = parseBearer("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
 * // 返回: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 * const invalid = parseBearer("Invalid header");
 * // 返回: null
 */
export function parseBearer(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.trim().split(" ");
  
  // 必须是 "Bearer <token>" 格式
  if (parts.length !== 2) {
    return null;
  }

  const [scheme, token] = parts;
  
  // 验证 scheme（不区分大小写）
  if (scheme.toLowerCase() !== "bearer") {
    return null;
  }

  // 验证 token 不为空
  if (!token || token.length === 0) {
    return null;
  }

  return token;
}

/**
 * @function verifyAccessToken
 * @description 验证访问令牌并返回完整 payload（为 WebSocket 提供）
 * @param {string} token - JWT Access Token
 * @returns {Promise<JwtUserPayload>} Payload 对象
 * @throws {错误} 验证失败抛出异常
 */
export async function verifyAccessToken(token: string): Promise<JwtUserPayload> {
  if (!token || token.length === 0) {
    throw new Error("Token is required");
  }

  // 使用 JWT 服务验证 token
  const payload = await jwtService.verifyAsync(token);
  
  // 验证 payload 必需字段
  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid token: missing user ID");
  }

  return payload;
}

/**
 * @function validateAccessToken
 * @description 验证访问令牌并返回用户 ID（异步）
 * @param {string} token - JWT Access Token
 * @returns {Promise<string | null>} 用户 ID Promise（payload.sub），验证失败返回 null
 * 
 * @example
 * const userId = await validateAccessToken(token);
 * if (userId) {
 *   console.log("User authenticated:", userId);
 * } else {
 *   console.log("Invalid or expired token");
 * }
 */
export async function validateAccessToken(token: string): Promise<string | null> {
  try {
    // 验证 token 格式
    if (!token || token.length === 0) {
      return null;
    }

    // 使用 JWT 服务验证 token
    const payload = await jwtService.verifyAsync(token);
    
    // 验证 payload 必需字段
    if (!payload.sub || typeof payload.sub !== "string") {
      return null;
    }

    // 可选：验证 token 类型是否为 access token
    // if (payload.tokenType !== "access") {
    //   return null;
    // }

    return payload.sub;
  } catch (error) {
    // 验证失败（签名无效、过期等）
    return null;
  }
}

/**
 * @function validateAccessTokenSync
 * @description 同步验证访问令牌并返回用户 ID（注意：实际验证是异步的，此函数返回 Promise）
 * @param {string} token - JWT Access Token
 * @returns {Promise<string | null>} 用户 ID Promise
 */
export async function validateAccessTokenSync(token: string): Promise<string | null> {
  try {
    if (!token || token.length === 0) {
      return null;
    }

    const payload = await jwtService.verifyAsync(token);
    
    if (!payload.sub || typeof payload.sub !== "string") {
      return null;
    }

    return payload.sub;
  } catch (error) {
    return null;
  }
}

/**
 * @function validateRefreshToken
 * @description 验证刷新令牌并返回用户 ID
 * @param {string} token - JWT Refresh Token
 * @returns {Promise<string | null>} 用户 ID Promise
 */
export async function validateRefreshToken(token: string): Promise<string | null> {
  try {
    if (!token || token.length === 0) {
      return null;
    }

    const payload = await jwtService.verifyAsync(token);
    
    if (!payload.sub || typeof payload.sub !== "string") {
      return null;
    }

    // 可选：验证 token 类型是否为 refresh token
    // if (payload.tokenType !== "refresh") {
    //   return null;
    // }

    return payload.sub;
  } catch (error) {
    return null;
  }
}

/**
 * @function generateAccessToken
 * @description 生成访问令牌
 * @param {string} userId - 用户 ID
 * @param {Partial<JwtUserPayload>} [additionalClaims] - 额外的声明
 * @returns {Promise<string>} JWT Token
 */
export async function generateAccessToken(
  userId: string,
  additionalClaims?: Partial<JwtUserPayload>
): Promise<string> {
  const payload: JwtUserPayload = {
    sub: userId,
    code: additionalClaims?.code || userId,
    roleId: additionalClaims?.roleId || "user",
    status: additionalClaims?.status || "active",
    tokenType: "access",
    ...additionalClaims,
  };

  return jwtService.signAsync("access", payload);
}

/**
 * @function generateRefreshToken
 * @description 生成刷新令牌
 * @param {string} userId - 用户 ID
 * @param {Partial<JwtUserPayload>} [additionalClaims] - 额外的声明
 * @returns {Promise<string>} JWT Token
 */
export async function generateRefreshToken(
  userId: string,
  additionalClaims?: Partial<JwtUserPayload>
): Promise<string> {
  const payload: JwtUserPayload = {
    sub: userId,
    code: additionalClaims?.code || userId,
    roleId: additionalClaims?.roleId || "user",
    status: additionalClaims?.status || "active",
    tokenType: "refresh",
    ...additionalClaims,
  };

  return jwtService.signAsync("refresh", payload);
}

/**
 * @function rotateRefreshToken
 * @description 刷新令牌轮转（使用旧的 refresh token 生成新的 access + refresh token）
 * @param {string} refreshToken - 旧的 Refresh Token
 * @returns {Promise<{access: string; refresh: string; payload: JwtUserPayload} | null>} 新的 token 对
 */
export async function rotateRefreshToken(
  refreshToken: string
): Promise<{ access: string; refresh: string; payload: JwtUserPayload } | null> {
  try {
    const result = await jwtService.rotateRefreshAsync(refreshToken);
    return result;
  } catch (error) {
    return null;
  }
}

/**
 * @function getJwtService
 * @description 获取 JWT 服务实例（用于高级操作）
 * @returns {typeof jwtService} JWT 服务实例
 */
export function getJwtService() {
  return jwtService;
}
