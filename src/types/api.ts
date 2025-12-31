/**
 * @packageDocumentation
 * @module api-types
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供 API 元数据相关类型定义与运行时常量
 */

import type { HttpMethod } from "@/config/request/http";
import type { CacheConfig } from "@/config/cache";
import type { FieldSelectConfig } from "@/config/field";
import type { OperateEnum } from "@/config/enum";

// ========================
// 按需导出子模块类型与常量
// ========================

export type { HttpMethod } from "@/config/request";
export { ALL_HTTP_METHODS } from "@/config/request/http";

export type { OperateEnum } from "@/config/enum";
export {
  ALL_OPERATE_ENUMS,
  isOperateEnum,
  assertOperateEnum,
  OPERATE_GROUPS,
  OPERATE_DESC_MAP,
} from "@/config/enum";

export type { CacheConfig } from "@/config/cache";
export { DEFAULT_CACHE_CONFIG } from "@/config/cache";

export type { FieldSelectConfig } from "@/config/field";
export { createFieldSelector } from "@/config/field";

export {
  SECOND,
  MINUTE,
  HOUR,
  DAY,
  WEEK,
  MONTH,
  parseDuration,
} from "@/utils/common/apitime";

/**
 * @interface API
 * @description 单个 HTTP API 元数据定义
 * @property {string} id - API 唯一标识
 * @property {HttpMethod} method - 请求方法
 * @property {string[]} models - 涉及的模型名称列表
 * @property {string[]} paths - 路径模式列表（如 "/users/:id"）
 * @property {string[]} roles - 允许访问的角色列表（统一小写）
 * @property {OperateEnum} operateEnum - 主要查询操作符类型
 * @property {string[]} dto - 关联的 DTO 名称列表
 * @property {string[]} [fields] - 默认返回字段列表或字段白名单
 * @property {CacheConfig} [cache] - 缓存配置（不限制缓存时间，启用/禁用由该配置控制）
 * @property {boolean} [enabled] - 顶层缓存开关（优先覆盖 cache.enabled）
 * @property {string[]} [keyFields] - 顶层缓存键字段（优先覆盖 cache.keyFields）
 * @property {boolean} [authRequired] - 是否需要认证
 * @property {string[]} [allowedSortFields] - 允许排序的字段列表
 * @property {string} [defaultSortField] - 默认排序字段
 * @property {string} [description] - API 描述
 */
export interface API {
  id: string;
  method: HttpMethod;
  models: string[];
  paths: string[];
  roles: string[];
  operateEnum: OperateEnum;
  dto: string[];
  fields?: string[];
  cache?: CacheConfig;
  enabled?: boolean;
  keyFields?: string[];
  authRequired?: boolean;
  allowedSortFields?: string[];
  defaultSortField?: string;
  description?: string;
}

/**
 * @interface APICollectionConfig
 * @description
 * API 集合级别的通用配置（可选）。用于统一规定字段选择等行为。
 * @property {FieldSelectConfig} [fieldSelect] - 字段选择配置
 */
export interface APICollectionConfig {
  fieldSelect?: FieldSelectConfig;
}
