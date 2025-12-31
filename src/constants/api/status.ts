/**
 * @packageDocumentation
 * @module constants/api/status
 * @since 1.0.0 (2025-12-22)
 * @author Z-kali
 * @description HTTP 状态码常量与类型定义
 * @see src/constants/api/index.ts
 */
/**
 * @const HTTP_STATUS
 * @description 常见 HTTP 状态码常量集合
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  BAD_GATEWAY: 502,
  GATEWAY_TIMEOUT: 504,
} as const;
/**
 * @type HttpStatus
 * @description 状态码联合类型，由 {@link HTTP_STATUS} 反推得到
 */
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
