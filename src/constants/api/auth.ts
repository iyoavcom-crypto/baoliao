/**
 * @packageDocumentation
 * @module constants/api/auth
 * @since 1.0.0 (2025-12-22)
 * @author Z-kali
 * @description 认证方案常量与类型定义
 * @see src/constants/api/index.ts
 */
/**
 * @const AUTH_SCHEME
 * @description 常见认证方案字符串前缀
 */
export const AUTH_SCHEME = {
  BEARER: "Bearer",
  BASIC: "Basic",
  API_KEY: "ApiKey",
} as const;
/**
 * @type AuthScheme
 * @description 认证方案联合类型，由 {@link AUTH_SCHEME} 反推得到
 */
export type AuthScheme = typeof AUTH_SCHEME[keyof typeof AUTH_SCHEME];
