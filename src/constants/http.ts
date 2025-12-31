/**
 * @packageDocumentation
 * @module constants/http
 * @since 1.0.0 (2025-12-31)
 * @author Z-kali
 * @description HTTP 相关的常量定义（方法、头部、状态码等）
 */

import { HTTP_METHOD } from "./api/method";

/**
 * @const HTTP_METHODS
 * @description HTTP 方法数组，用于 CORS 配置等场景
 * @example
 * ```typescript
 * cors({ methods: HTTP_METHODS })
 * ```
 */
export const HTTP_METHODS = [
  HTTP_METHOD.GET,
  HTTP_METHOD.POST,
  HTTP_METHOD.PUT,
  HTTP_METHOD.DELETE,
  HTTP_METHOD.PATCH,
  HTTP_METHOD.OPTIONS,
] as const;

/**
 * @const COMMON_HEADERS
 * @description 常用的 HTTP 请求头
 */
export const COMMON_HEADERS = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",
  X_REQUEST_ID: "X-Request-Id",
  X_TRACE_ID: "X-Trace-Id",
  X_DEVICE_ID: "X-Device-Id",
} as const;

/**
 * @const ALLOWED_REQUEST_HEADERS
 * @description CORS 允许的请求头列表
 */
export const ALLOWED_REQUEST_HEADERS = [
  COMMON_HEADERS.CONTENT_TYPE,
  COMMON_HEADERS.AUTHORIZATION,
  COMMON_HEADERS.X_REQUEST_ID,
  COMMON_HEADERS.X_TRACE_ID,
  COMMON_HEADERS.X_DEVICE_ID,
] as const;

/**
 * @const EXPOSED_RESPONSE_HEADERS
 * @description CORS 暴露的响应头列表
 */
export const EXPOSED_RESPONSE_HEADERS = [
  COMMON_HEADERS.X_REQUEST_ID,
  COMMON_HEADERS.X_TRACE_ID,
  "X-Response-Time",
  "Server-Timing",
] as const;

// 重新导出 HTTP_METHOD 便于统一导入
export { HTTP_METHOD };
