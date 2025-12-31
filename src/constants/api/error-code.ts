/**
 * @packageDocumentation
 * @module constants/api/error-code
 * @since 1.0.0 (2025-12-22)
 * @author Z-kali
 * @description API 业务错误码常量与类型定义
 * @see src/constants/api/index.ts
 */
/**
 * @const API_ERROR_CODE
 * @description
 * API 错误码常量集合（REST/JSON 响应的业务错误标识）。
 *
 * - invalid_params     → 参数非法或缺失
 * - unauthorized       → 未认证或令牌失效
 * - forbidden          → 已认证但无访问权限
 * - not_found          → 资源不存在
 * - conflict           → 资源冲突（如唯一键）
 * - too_many_requests  → 频率限制
 * - internal_error     → 服务器内部错误
 * - service_unavailable → 服务不可用/维护中
 */
export const API_ERROR_CODE = {
  INVALID_PARAMS: "invalid_params",
  VALIDATION_FAILED: "validation_failed",
  UNAUTHORIZED: "unauthorized",
  TOKEN_EXPIRED: "token_expired",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  CONFLICT: "conflict",
  TOO_MANY_REQUESTS: "too_many_requests",
  INTERNAL_ERROR: "internal_error",
  SERVICE_UNAVAILABLE: "service_unavailable",
  BAD_GATEWAY: "bad_gateway",
  GATEWAY_TIMEOUT: "gateway_timeout",
  // 消息相关错误码
  MESSAGE_NOT_FOUND: "message_not_found",
  PERMISSION_DENIED: "permission_denied",
  TIMEOUT_EXCEEDED: "timeout_exceeded",
  ALREADY_RECALLED: "already_recalled",
} as const;
/**
 * @type ApiErrorCode
 * @description
 * API 错误码联合类型，由 {@link API_ERROR_CODE} 反推得到。
 */
export type ApiErrorCode = typeof API_ERROR_CODE[keyof typeof API_ERROR_CODE];
