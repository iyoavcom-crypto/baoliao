/**
 * @packageDocumentation
 * @module api-config-cache-provider
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供基于 CacheConfig 的缓存读写接口
 * @see src/api/config/cache/provider.ts
 */

import type { CacheConfig } from "./cache.js";
import { getCacheEntry, setCacheEntry } from "./store.js";
import { buildCacheKey } from "./key.js";

/**
 * @function getFromCache
 * @description 根据配置与上下文从缓存中读取数据
 * @param {CacheConfig} cfg - 缓存配置
 * @param {Record<string, unknown>} ctx - 上下文对象（用于构造缓存 Key）
 * @returns {T | undefined} 命中则返回缓存值，否则返回 undefined
 */
export function getFromCache<T>(
  cfg: CacheConfig,
  ctx: Record<string, unknown>,
): T | undefined {
  const key = buildCacheKey(cfg, ctx);
  if (!key) return undefined;

  const entry = getCacheEntry<T>(key);
  return entry?.value;
}

/**
 * @function setCache
 * @description 根据配置与上下文写入缓存（仅在 cfg.enabled === true 时生效）
 * @param {CacheConfig} cfg - 缓存配置
 * @param {Record<string, unknown>} ctx - 上下文对象（用于构造缓存 Key）
 * @param {T} value - 要缓存的值
 */
export function setCache<T>(
  cfg: CacheConfig,
  ctx: Record<string, unknown>,
  value: T,
): void {
  const key = buildCacheKey(cfg, ctx);
  if (!key) return;

  setCacheEntry<T>(key, value);
}
