/**
 * @packageDocumentation
 * @module api-config-cache-key
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供基于 CacheConfig 与上下文的缓存 Key 生成工具
 * @see src/api/config/cache/key.ts
 */

import type { CacheConfig } from "./cache.js";

/**
 * @function getNestedValue
 * @description 根据路径（如 "query.user.id"）从对象中安全获取嵌套值
 * @param {Record<string, unknown>} target - 目标对象
 * @param {string} path - 使用 "." 分隔的路径
 * @returns {unknown} 读取到的值，不存在时返回 undefined
 */
export function getNestedValue(
  target: Record<string, unknown>,
  path: string,
): unknown {
  const parts = path.split(".");
  let current: unknown = target;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * @function serializeForKey
 * @description 将值稳定序列化为用于缓存 Key 的字符串（对象键有序、日期使用 ISO、BigInt 转字符串、字符串去除首尾空白）
 * @param {unknown} value - 任意值（可能为对象、数组、原始类型、日期等）
 * @returns {string} 稳定且可比较的字符串表示
 */
function serializeForKey(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }

  if (typeof value === "string") {
    return JSON.stringify(value.trim());
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (typeof value === "bigint") {
    return JSON.stringify(value.toString());
  }

  if (value instanceof Date) {
    return JSON.stringify(value.toISOString());
  }

  if (Array.isArray(value)) {
    const serializedArr = value.map((v) => JSON.parse(serializeForKey(v)));
    return JSON.stringify(serializedArr);
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const stable: Record<string, unknown> = {};
    for (const k of keys) {
      stable[k] = JSON.parse(serializeForKey(obj[k]));
    }
    return JSON.stringify(stable);
  }

  return JSON.stringify(value);
}

/**
 * @function buildCacheKey
 * @description 根据 CacheConfig 和上下文生成缓存 Key
 * @param {CacheConfig} cfg - 缓存配置
 * @param {Record<string, unknown>} ctx - 上下文（如 path、query、params、body 等）
 * @returns {string | null} 缓存 Key，若 cfg.enabled === false 则返回 null
 */
export function buildCacheKey(
  cfg: CacheConfig,
  ctx: Record<string, unknown>,
): string | null {
  if (!cfg.enabled) return null;

  const segments: string[] = [];

  for (const fieldPath of cfg.keyFields) {
    const value = getNestedValue(ctx, fieldPath);
    const serialized = serializeForKey(value);
    segments.push(`${fieldPath}=${serialized}`);
  }

  return segments.join("|");
}
