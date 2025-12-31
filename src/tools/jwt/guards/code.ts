/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt-guards-code
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 守卫：校验业务编码 (payload.code)
 */

import { AuthError, AuthErrorCode } from "../errors";
import type { JwtUserPayload } from "@/types/jwt";


/**
 * @function assertUserCode
 * @description 断言业务标识 code 等于目标
 * @param {JwtUserPayload} p - 业务载荷
 * @param {string} code - 目标业务标识
 * @returns {JwtUserPayload} 原始载荷
 * @throws {AuthError} Forbidden 当不匹配
 * @example
 * assertUserCode(payload, "user_001");
 * @complexity O(1)
 * @idempotent true
 */
export function assertUserCode(p: JwtUserPayload, code: string): JwtUserPayload {
  if (p.code !== code) {
    throw new AuthError(AuthErrorCode.Forbidden, "User code mismatch", 403);
  }
  return p;
}
