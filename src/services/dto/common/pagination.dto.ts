/**
 * @packageDocumentation
 * @module dto/common/pagination
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 通用分页响应DTO，支持页码分页和游标分页
 */

/**
 * @interface PageDto
 * @description 页码分页响应结构（适用于总数已知的场景）
 * @template T - 列表项类型
 * @property {T[]} items - 数据列表
 * @property {number} page - 当前页码（从1开始）
 * @property {number} size - 每页数量
 * @property {number} total - 总记录数
 * @property {number} totalPages - 总页数
 * @property {string} [orderBy] - 排序字段
 * @property {"ASC" | "DESC"} [order] - 排序方向
 */
export interface PageDto<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
}

/**
 * @interface CursorDto
 * @description 游标分页响应结构（适用于大数据集、实时流）
 * @template T - 列表项类型
 * @property {T[]} items - 数据列表
 * @property {number} limit - 拉取数量上限
 * @property {string | null} cursor - 当前游标（客户端传入）
 * @property {string | null} nextCursor - 下一页游标
 * @property {string | null} prevCursor - 上一页游标
 * @property {boolean} hasMore - 是否有更多数据
 */
export interface CursorDto<T> {
  items: T[];
  limit: number;
  cursor: string | null;
  nextCursor: string | null;
  prevCursor?: string | null;
  hasMore: boolean;
}

/**
 * @interface OffsetDto
 * @description 偏移量分页响应结构（简化版，不计算总数）
 * @template T - 列表项类型
 * @property {T[]} items - 数据列表
 * @property {number} offset - 当前偏移量
 * @property {number} limit - 每次拉取数量
 * @property {boolean} hasMore - 是否有更多数据
 */
export interface OffsetDto<T> {
  items: T[];
  offset: number;
  limit: number;
  hasMore: boolean;
}

/**
 * @interface InfiniteScrollDto
 * @description 无限滚动分页响应（移动端常用）
 * @template T - 列表项类型
 * @property {T[]} items - 数据列表
 * @property {string | number | null} nextToken - 下一批数据的令牌
 * @property {boolean} hasMore - 是否有更多数据
 */
export interface InfiniteScrollDto<T> {
  items: T[];
  nextToken: string | number | null;
  hasMore: boolean;
}
