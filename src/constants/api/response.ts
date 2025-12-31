/**
 * @packageDocumentation
 * @module constants/api/response
 * @since 1.0.0 (2025-12-22)
 * @author Z-kali
 * @description API 标准响应字段常量与类型定义
 * @see src/constants/api/index.ts
 */
/**
 * @const API_RESPONSE_FIELD
 * @description 标准响应结构字段名集合
 */
export const API_RESPONSE_FIELD = {
  CODE: "code",
  MESSAGE: "message",
  DATA: "data",
  RETRIABLE: "retriable",
  SERVER_TIME: "serverTime",
  REQUEST_ID: "requestId",
} as const;
/**
 * @type ApiResponseField
 * @description 响应字段名联合类型，由 {@link API_RESPONSE_FIELD} 反推得到
 */
export type ApiResponseField = typeof API_RESPONSE_FIELD[keyof typeof API_RESPONSE_FIELD];
