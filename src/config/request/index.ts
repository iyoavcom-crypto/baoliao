/**
 * @packageDocumentation
 * @module api-config-request
 * @since 1.0.0 (2025-09-12)
 * @description 定义用于构造缓存 Key 的请求上下文结构
 * @see src/api/config/request/http/index.ts
 * @author Z-kali
 */

import type { HttpMethod } from "./http.js";

/**
 * @interface RequestContext
 * @description 构造缓存 Key 所需的请求上下文
 * @property {HttpMethod} method - HTTP 方法
 * @property {string} path - 实际请求路径（如 "/users/123"）
 * @property {Record<string, unknown>} query - 查询参数对象
 * @property {Record<string, unknown>} params - 路径参数对象
 * @property {unknown} body - 请求体
 * @property {string} project - 项目标识
 * @property {string | undefined} userId - 当前用户 ID
 */
export interface RequestContext {
  method: HttpMethod;
  path: string;
  query: Record<string, unknown>;
  params: Record<string, unknown>;
  body: unknown;
  project: string;
  userId?: string;
}

export type { HttpMethod } from "./http.js";
