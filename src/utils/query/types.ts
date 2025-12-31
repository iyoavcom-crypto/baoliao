/**
 * @packageDocumentation
 * @module query
 * @since 1.0.0 (2025-01-07)
 * @author Z-kali
 * @description Query module type definitions
 */

/**
 * @interface FilterValue
 * @description 字段过滤值描述，支持精确匹配、范围查询、模糊查询与集合查询等多种模式
 * @property {unknown} [eq] - 等于匹配（=），用于精确值过滤
 * @property {unknown} [ne] - 不等于匹配（!=），用于排除指定值
 * @property {number | string | Date} [gt] - 大于匹配（>），适用于数值、字符串或日期
 * @property {number | string | Date} [gte] - 大于等于匹配（>=），适用于数值、字符串或日期
 * @property {number | string | Date} [lt] - 小于匹配（<），适用于数值、字符串或日期
 * @property {number | string | Date} [lte] - 小于等于匹配（<=），适用于数值、字符串或日期
 * @property {string} [like] - 模糊匹配（LIKE），内部自动包裹为 "%值%"
 * @property {unknown[]} [in] - IN 集合匹配，数组内任一元素匹配即可
 * @property {unknown[]} [notIn] - NOT IN 集合排除，排除数组中的所有元素
 * @property {string} [prefix] - 前缀匹配（LIKE 'value%'）
 * @property {string[]} [prefixList] - 前缀列表匹配（OR LIKE 'value%'）
 */
export interface FilterValue {
  eq?: unknown;
  ne?: unknown;
  gt?: number | string | Date;
  gte?: number | string | Date;
  lt?: number | string | Date;
  lte?: number | string | Date;
  like?: string;
  in?: unknown[];
  notIn?: unknown[];
  prefix?: string;
  prefixList?: string[];
}

/**
 * @interface BuildWhereOptions
 * @description 构建 where 条件的高层封装选项
 * @property {Record<string, unknown>} [filters] - 精确与范围过滤条件，键为字段名，值为 FilterValue 或原始值
 * @property {string} [search] - 关键字搜索串，将对子段 searchFields 执行 LIKE 查询
 * @property {string[]} [searchFields] - 参与模糊搜索的字段名列表
 */
export interface BuildWhereOptions {
  filters?: Record<string, unknown>;
  search?: string;
  searchFields?: string[];
}

/**
 * @interface PaginationQuery
 * @description 分页查询入参，主要用于 HTTP 查询参数接收
 * @property {number | string} [page] - 页码，从 1 开始；可为数字或可解析为整数的字符串
 * @property {number | string} [limit] - 每页数量；可为数字或可解析为整数的字符串
 */
export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
}

/**
 * @interface PaginationResult
 * @description 标准化分页结果，用于拼接 Sequelize 查询参数
 * @property {number} page - 标准化后的当前页码（>=1）
 * @property {number} limit - 标准化后的每页数量（范围 [1, 200]）
 * @property {number} offset - 偏移量，计算公式为 (page - 1) * limit
 */
export interface PaginationResult {
  page: number;
  limit: number;
  offset: number;
}
