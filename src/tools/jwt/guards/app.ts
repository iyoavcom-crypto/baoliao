/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt-guards-code
 * @since 1.0.0 (2025-09-12)
 * @description 守卫：校验业务编码 (payload.appid)
 */

import { AuthError, AuthErrorCode } from "../errors";
// 关键：引入类型声明（注意这里是 import type）
import type { AppJwtPayload } from "@/types/jwt/app-types";

/**
 * @function assertAppCode
 * @description 断言业务标识 appid 等于目标
 * @param {AppJwtPayload} p - 业务载荷
 * @param {string} code - 目标业务标识
 * @returns {AppJwtPayload} 原始载荷
 * @throws {AuthError} Forbidden 当不匹配
 */
export function assertAppCode(
  p: AppJwtPayload,
  code: string
): AppJwtPayload {
  if (p.appid !== code) {
    throw new AuthError(AuthErrorCode.Forbidden, "App code mismatch", 403);
  }
  return p;
}
