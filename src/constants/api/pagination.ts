/**
 * @packageDocumentation
 * @module constants/api/pagination
 * @since 1.0.0 (2025-12-22)
 * @author Z-kali
 * @description 分页与排序常量与类型定义
 * @see src/constants/api/index.ts
 */
/**
 * @const PAGINATION_PARAM
 * @description
 * 分页相关参数名常量集合（统一 query/body 字段）。
 *
 * - page    → 页号（从 1 开始）
 * - size    → 每页数量
 * - cursor  → 游标（增量/滚动分页）
 * - limit   → 拉取数量上限
 * - orderBy → 排序字段名
 * - order   → 排序方向（ASC/DESC）
 */
export const PAGINATION_PARAM = {
  PAGE: "page",
  SIZE: "size",
  OFFSET: "offset",
  CURSOR: "cursor",
  BEFORE: "before",
  AFTER: "after",
  LIMIT: "limit",
  ORDER_BY: "orderBy",
  ORDER_DIR: "order",
} as const;
export type PaginationParam = typeof PAGINATION_PARAM[keyof typeof PAGINATION_PARAM];

/**
 * @const ORDER_DIR
 * @description
 * 排序方向常量集合。
 *
 * - ASC  → 升序
 * - DESC → 降序
 */
export const ORDER_DIR = {
  ASC: "ASC",
  DESC: "DESC",
} as const;
export type OrderDir = typeof ORDER_DIR[keyof typeof ORDER_DIR];
