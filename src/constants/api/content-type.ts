/**
 * @packageDocumentation
 * @module constants/api/content-type
 * @since 1.0.0 (2025-12-22)
 * @author Z-kali
 * @description HTTP Content-Type 常量与类型定义
 * @see src/constants/api/index.ts
 */
/**
 * @const CONTENT_TYPE
 * @description
 * HTTP Content-Type 常量集合（请求与响应主体类型）。
 *
 * - application/json              → JSON 文本
 * - multipart/form-data           → 表单（含文件）
 * - application/x-www-form-urlencoded → URL 编码表单
 * - text/plain                    → 纯文本
 * - application/octet-stream      → 二进制流
 */
export const CONTENT_TYPE = {
  JSON: "application/json",
  PROBLEM_JSON: "application/problem+json",
  FORM_DATA: "multipart/form-data",
  URL_ENCODED: "application/x-www-form-urlencoded",
  TEXT: "text/plain",
  OCTET_STREAM: "application/octet-stream",
} as const;
/**
 * @type ContentType
 * @description
 * Content-Type 联合类型，由 {@link CONTENT_TYPE} 反推得到。
 */
export type ContentType = typeof CONTENT_TYPE[keyof typeof CONTENT_TYPE];
