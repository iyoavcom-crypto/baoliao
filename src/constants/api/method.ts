/**
 * @packageDocumentation
 * @module constants/api/method
 * @since 1.0.0 (2025-12-22)
 * @author Z-kali
 * @description HTTP 方法常量与类型定义
 * @see src/constants/api/index.ts
 */
/**
 * @const HTTP_METHOD
 * @description
 * HTTP 方法常量集合（统一字符串来源；用于路由定义与客户端请求）。
 *
 * - GET     → 读取资源
 * - POST    → 创建资源
 * - PUT     → 覆盖更新资源
 * - PATCH   → 部分更新资源
 * - DELETE  → 删除资源
 * - HEAD    → 仅获取响应头
 * - OPTIONS → 预检与能力查询
 */
export const HTTP_METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
} as const;
/**
 * @type HttpMethod
 * @description
 * HTTP 方法联合类型，由 {@link HTTP_METHOD} 反推得到。
 */
export type HttpMethod = typeof HTTP_METHOD[keyof typeof HTTP_METHOD];
