/**
 * @packageDocumentation
 * @module api-config-enum
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供 API 元数据相关类型定义、运行时校验常量与工具方法
 * @see src/api/config/enum.ts
 */

/**
 * @type OperateEnum
 * @description 查询操作符类型
 */
export type OperateEnum =
  // 通用比较
  | "eq"
  | "ne"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  // 区间
  | "between"
  | "notBetween"
  // 集合关系
  | "in"
  | "nin"
  // 文本匹配
  | "like"
  | "notLike"
  | "iLike"
  | "notILike"
  | "startsWith"
  | "endsWith"
  | "regex"
  | "notRegex"
  // 集合/数组字段
  | "contains"
  | "notContains"
  | "overlap"
  | "notOverlap"
  | "subset"
  | "superset"
  // 空值/存在性/布尔
  | "isnull"
  | "notnull"
  | "exists"
  | "notExists"
  | "isTrue"
  | "isFalse";

/**
 * @constant ALL_OPERATE_ENUMS
 * @description 支持的 OperateEnum 常量列表（运行时校验用）
 */
export const ALL_OPERATE_ENUMS: readonly OperateEnum[] = [
  "eq",
  "ne",
  "gt",
  "lt",
  "gte",
  "lte",
  "between",
  "notBetween",
  "in",
  "nin",
  "like",
  "notLike",
  "iLike",
  "notILike",
  "startsWith",
  "endsWith",
  "regex",
  "notRegex",
  "contains",
  "notContains",
  "overlap",
  "notOverlap",
  "subset",
  "superset",
  "isnull",
  "notnull",
  "exists",
  "notExists",
  "isTrue",
  "isFalse",
] as const;

/**
 * @function isOperateEnum
 * @description 判断一个值是否为合法 OperateEnum（类型守卫）
 * @param {unknown} val - 任意输入值
 * @returns {val is OperateEnum} 是否为 OperateEnum
 */
export function isOperateEnum(val: unknown): val is OperateEnum {
  return typeof val === "string" && ALL_OPERATE_ENUMS.includes(val as OperateEnum);
}

/**
 * @constant OPERATE_GROUPS
 * @description 将操作符按语义进行分组，便于 UI/DSL 使用
 */
export const OPERATE_GROUPS = {
  compare: ["eq", "ne", "gt", "lt", "gte", "lte"] as const,
  range: ["between", "notBetween"] as const,
  set: ["in", "nin"] as const,
  text: [
    "like",
    "notLike",
    "iLike",
    "notILike",
    "startsWith",
    "endsWith",
    "regex",
    "notRegex",
  ] as const,
  array: [
    "contains",
    "notContains",
    "overlap",
    "notOverlap",
    "subset",
    "superset",
  ] as const,
  nullability: ["isnull", "notnull"] as const,
  existence: ["exists", "notExists"] as const,
  boolean: ["isTrue", "isFalse"] as const,
} as const;

/**
 * @constant OPERATE_DESC_MAP
 * @description 操作符语义说明映射（运行时帮助 UI 或调试）
 */
export const OPERATE_DESC_MAP: Record<OperateEnum, string> = {
  eq: "等于",
  ne: "不等于",
  gt: "大于",
  lt: "小于",
  gte: "大于等于",
  lte: "小于等于",
  between: "区间内",
  notBetween: "不在区间内",
  in: "在集合中",
  nin: "不在集合中",
  like: "模糊匹配",
  notLike: "非模糊匹配",
  iLike: "不区分大小写的模糊匹配",
  notILike: "不区分大小写的模糊匹配取反",
  startsWith: "前缀匹配",
  endsWith: "后缀匹配",
  regex: "正则匹配",
  notRegex: "正则不匹配",
  contains: "数组包含值",
  notContains: "数组不包含值",
  overlap: "数组与集合有交集",
  notOverlap: "数组与集合无交集",
  subset: "数组是入参集合的子集",
  superset: "数组是入参集合的超集",
  isnull: "为 null",
  notnull: "不为 null",
  exists: "存在字段",
  notExists: "不存在字段",
  isTrue: "布尔值为 true",
  isFalse: "布尔值为 false",
};

/**
 * @function assertOperateEnum
 * @description 对外暴露的严格校验（非法时抛出错误）
 * @param {unknown} val - 待校验值
 * @throws {Error} 非法时抛出错误
 */
export function assertOperateEnum(val: unknown): asserts val is OperateEnum {
  if (!isOperateEnum(val)) {
    throw new Error(`Invalid OperateEnum: ${String(val)}`);
  }
}
