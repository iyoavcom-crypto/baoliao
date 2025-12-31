/**
 * @packageDocumentation
 * @module api-config-cache-cache
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供缓存配置相关类型定义
 * @see src/api/config/cache/cache.ts
 */

/**
 * @interface CacheConfig
 * @description 缓存配置（不限制缓存时间）
 * @property {boolean} enabled - 是否启用缓存
 * @property {string[]} keyFields - 参与构造缓存 Key 的上下文字段路径（如 "path"、"query.userId"）
 */
export interface CacheConfig {
  enabled: boolean;
  keyFields: string[];
}

/**
 * @constant DEFAULT_CACHE_CONFIG
 * @description 默认缓存配置（业务可基于此进行拓展）
 */
export const DEFAULT_CACHE_CONFIG: Readonly<CacheConfig> = {
  enabled: false,
  keyFields: [],
} as const;
