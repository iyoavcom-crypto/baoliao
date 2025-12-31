/**
 * @packageDocumentation
 * @module constants/api/header
 * @since 1.0.0 (2025-12-22)
 * @author Z-kali
 * @description API 请求/响应头字段名常量与类型定义
 * @see src/constants/api/index.ts
 */
/**
 * @const API_HEADER
 * @description
 * 常用 API 请求/响应头字段名常量集合。
 *
 * - Authorization    → 认证令牌（如 Bearer）
 * - X-Request-Id     → 请求唯一 ID（链路关联）
 * - X-Trace-Id       → Trace ID（链路追踪）
 * - X-Client-Version → 客户端版本
 * - X-Platform       → 平台（web/ios/android/desktop）
 * - X-Device-Id      → 设备唯一 ID
 * - Content-Type     → 请求/响应主体类型
 * - Accept           → 客户端可接受的返回类型
 */
export const API_HEADER = {
  AUTHORIZATION: "Authorization",
  REQUEST_ID: "X-Request-Id",
  TRACE_ID: "X-Trace-Id",
  API_VERSION: "X-Api-Version",
  CLIENT_VERSION: "X-Client-Version",
  PLATFORM: "X-Platform",
  DEVICE_ID: "X-Device-Id",
  LOCALE: "X-Locale",
  TIMEZONE: "X-Timezone",
  REQUEST_TS: "X-Request-Ts",
  CONTENT_TYPE: "Content-Type",
  ACCEPT: "Accept",
} as const;
/**
 * @type ApiHeader
 * @description
 * 头字段名联合类型，由 {@link API_HEADER} 反推得到。
 */
export type ApiHeader = typeof API_HEADER[keyof typeof API_HEADER];
