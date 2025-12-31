/**
 * @packageDocumentation
 * @module api-config-loader-cache
 * @since 1.0.0 (2025-11-15)
 * @author Z-kali
 * @description 从 JSON 动态加载并校验 API 
 * @see src/api/config/loader/cache.ts
 */
import type { CacheConfig } from "@/types/api";

/**
 * @function normalizeCache
 * @description 兼容并规范化缓存配置为 CacheConfig
 * @param {Record<string, unknown>} cacheRaw - 原始缓存配置
 * @param {string} path - 配置路径（用于错误提示）
 * @returns {CacheConfig} 规范化后的缓存配置
 */
export function normalizeCache(cacheRaw: Record<string, unknown>, path: string): CacheConfig {
  const enabled = Boolean(cacheRaw.enabled);
  const keyFields = Array.isArray(cacheRaw.keyFields) ? (cacheRaw.keyFields as string[]) : [];
  if (enabled) {
    if (keyFields.length === 0) throw new Error(`${path}.keyFields 必须为非空字符串数组`);
  }
  return { enabled, keyFields };
}

/**
 * @function inferKeyFieldsFromTemplate
 * @description 从简单模板字符串中推断 keyFields（支持 {{id}}、{{page}}、{{pageSize}} 等常用占位符）
 * @param {string} _tpl - 缓存键模板字符串
 * @returns {string[]} 提取到的 keyFields 数组（可能为空）
 */
export function inferKeyFieldsFromTemplate(_tpl: string): string[] {
  const tpl = String(_tpl);
  const tokens: string[] = [];
  const re = /\{\{\s*([^}]+?)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tpl)) !== null) {
    const raw = (m[1] ?? "").trim();
    if (!raw) continue;
    let norm = raw;
    if (!raw.includes(".")) {
      const lower = raw.toLowerCase();
      if (lower === "path") {
        norm = "path";
      } else if (lower === "page") {
        norm = "query.page";
      } else if (lower === "pagesize") {
        norm = "query.pageSize";
      } else if (lower === "id") {
        norm = "params.id";
      } else {
        norm = `params.${raw}`;
      }
    }
    tokens.push(norm);
  }
  return Array.from(new Set(tokens));
}