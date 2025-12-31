/**
 * @packageDocumentation
 * @module api-config-cache-store
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供基于 Map 的进程内缓存存储与清理方法（无 TTL 策略）
 * @see src/api/config/cache/store.ts
 */

/**
 * @interface CacheEntry
 * @description 缓存条目（仅存储 value，预留扩展空间）
 * @property {T} value - 缓存值
 */
export interface CacheEntry<T> {
  value: T;
}

/**
 * @constant cacheStore
 * @description 全局缓存存储器（Key → 缓存条目）
 */
export const cacheStore = new Map<string, CacheEntry<unknown>>();

/**
 * @function getCacheEntry
 * @description 根据 Key 获取缓存条目
 * @param {string} key - 缓存 Key
 * @returns {CacheEntry<T> | undefined} 命中则返回缓存条目，否则返回 undefined
 */
export function getCacheEntry<T>(key: string): CacheEntry<T> | undefined {
  return cacheStore.get(key) as CacheEntry<T> | undefined;
}

/**
 * @function setCacheEntry
 * @description 设置缓存条目
 * @param {string} key - 缓存 Key
 * @param {T} value - 缓存值
 */
export function setCacheEntry<T>(key: string, value: T): void {
  cacheStore.set(key, { value });
}

/**
 * @function clearAllCache
 * @description 清空所有缓存
 */
export function clearAllCache(): void {
  cacheStore.clear();
}

/**
 * @function deleteCacheByKey
 * @description 根据完整 Key 删除单条缓存
 * @param {string} key - 缓存 Key
 * @returns {boolean} 是否删除成功
 */
export function deleteCacheByKey(key: string): boolean {
  return cacheStore.delete(key);
}

/**
 * @function deleteCacheByPattern
 * @description 通过正则表达式匹配 Key 批量删除缓存
 * @param {RegExp} pattern - 用于匹配缓存 Key 的正则表达式
 * @returns {number} 被删除的缓存条目数量
 */
export function deleteCacheByPattern(pattern: RegExp): number {
  let removed = 0;

  for (const key of cacheStore.keys()) {
    if (pattern.test(key)) {
      cacheStore.delete(key);
      removed += 1;
    }
  }

  return removed;
}
