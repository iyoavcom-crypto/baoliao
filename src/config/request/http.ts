/**
 * @packageDocumentation
 * @module api-config-request-http
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供 API 元数据相关类型定义与运行时常量
 * @see src/api/config/request/http/http.ts
 */

/**
 * @type HttpMethod
 * @description 支持的 HTTP 方法
 * @property {HttpMethod} GET - 获取资源
 * @property {HttpMethod} POST - 创建资源
 * @property {HttpMethod} PUT - 更新资源
 * @property {HttpMethod} DELETE - 删除资源
 * @property {HttpMethod} PATCH - 部分更新资源
 * @property {HttpMethod} OPTIONS - 获取资源选项
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";

/**
 * @constant ALL_HTTP_METHODS
 * @description 支持的 HTTP 方法常量列表（用于运行时校验）
 */
export const ALL_HTTP_METHODS: readonly HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
] as const;