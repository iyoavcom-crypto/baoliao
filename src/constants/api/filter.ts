/**
 * @packageDocumentation
 * @module constants/api/filter
 * @since 1.0.0 (2025-12-22)
 * @author Z-kali
 * @description 通用筛选参数名常量与类型（仅包含通用字段）
 */

/**
 * @const FILTER_PARAM
 * @description 
 * 通用筛选参数名集合（仅保留通用字段，模型特定筛选应在各模块constants中定义）
 * 
 * 通用类：
 * - keyword        → 关键字搜索（跨多个字段模糊匹配）
 * - search         → 全文搜索
 * - q              → 简化搜索参数
 * 
 * 时间范围类：
 * - createdFrom    → 创建时间起始
 * - createdTo      → 创建时间截止
 * - updatedFrom    → 更新时间起始
 * - updatedTo      → 更新时间截止
 * 
 * ID筛选类：
 * - ids            → 批量ID筛选（逗号分隔或数组）
 * - excludeIds     → 排除ID列表
 * 
 * 注意：
 * - 模型特定筛选参数（如 state, roleId, vip）应在各模块的constants中定义
 * - 例如：constants/im/user/filters.ts 定义 USER_FILTER_PARAM
 */
export const FILTER_PARAM = {
  // 搜索参数
  KEYWORD: "keyword",
  SEARCH: "search",
  Q: "q",
  
  // 时间范围
  CREATED_FROM: "createdFrom",
  CREATED_TO: "createdTo",
  UPDATED_FROM: "updatedFrom",
  UPDATED_TO: "updatedTo",
  
  // ID筛选
  IDS: "ids",
  EXCLUDE_IDS: "excludeIds",
} as const;

/**
 * @type FilterParam
 * @description 筛选参数名联合类型
 */
export type FilterParam = typeof FILTER_PARAM[keyof typeof FILTER_PARAM];

