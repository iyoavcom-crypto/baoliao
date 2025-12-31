/**
 * @packageDocumentation
 * @module api-config-cache
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 缓存模块入口文件，汇总导出配置、存储、Key 工具与提供器
 * @see src/api/config/cache/index.ts
 */

export type { CacheConfig } from "./cache";
export { DEFAULT_CACHE_CONFIG } from "./cache";

export type { CacheEntry } from "./store";
export {
  cacheStore,
  getCacheEntry,
  setCacheEntry,
  clearAllCache,
  deleteCacheByKey,
  deleteCacheByPattern,
} from "./store";

export { getNestedValue, buildCacheKey } from "./key";

export { getFromCache, setCache } from "./provider";
