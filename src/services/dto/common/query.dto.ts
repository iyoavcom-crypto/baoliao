/**
 * @packageDocumentation
 * @module dto/common/query
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 通用查询参数DTO，用于列表接口的请求参数
 */

/**
 * @interface ListQueryDto
 * @description 页码分页查询参数（标准列表查询）
 * @property {number} [page] - 页码（从1开始，默认1）
 * @property {number} [size] - 每页数量（默认20，最大200）
 * @property {string} [orderBy] - 排序字段名
 * @property {"ASC" | "DESC"} [order] - 排序方向（默认DESC）
 * @property {string} [keyword] - 关键字搜索
 * @property {string} [search] - 全文搜索
 */
export interface ListQueryDto {
  page?: number;
  size?: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
  keyword?: string;
  search?: string;
}

/**
 * @interface CursorQueryDto
 * @description 游标分页查询参数（大数据集、实时流）
 * @property {string} [cursor] - 当前游标
 * @property {string} [before] - 向前查询游标
 * @property {string} [after] - 向后查询游标
 * @property {number} [limit] - 拉取数量（默认50，最大500）
 */
export interface CursorQueryDto {
  cursor?: string;
  before?: string;
  after?: string;
  limit?: number;
}

/**
 * @interface OffsetQueryDto
 * @description 偏移量查询参数（简化版分页）
 * @property {number} [offset] - 偏移量（默认0）
 * @property {number} [limit] - 拉取数量（默认20，最大200）
 */
export interface OffsetQueryDto {
  offset?: number;
  limit?: number;
}

/**
 * @interface TimeRangeQueryDto
 * @description 时间范围查询参数（可复用）
 * @property {string | Date | number} [createdFrom] - 创建时间起始
 * @property {string | Date | number} [createdTo] - 创建时间截止
 * @property {string | Date | number} [updatedFrom] - 更新时间起始
 * @property {string | Date | number} [updatedTo] - 更新时间截止
 */
export interface TimeRangeQueryDto {
  createdFrom?: string | Date | number;
  createdTo?: string | Date | number;
  updatedFrom?: string | Date | number;
  updatedTo?: string | Date | number;
}

/**
 * @interface IdsQueryDto
 * @description 批量ID查询参数
 * @property {string[]} [ids] - ID列表
 * @property {string[]} [excludeIds] - 排除ID列表
 */
export interface IdsQueryDto {
  ids?: string[];
  excludeIds?: string[];
}

/**
 * @interface FullListQueryDto
 * @description 完整列表查询参数（组合所有通用参数）
 */
export interface FullListQueryDto extends ListQueryDto, TimeRangeQueryDto, IdsQueryDto {}
