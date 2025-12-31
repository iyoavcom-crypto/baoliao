/**
 * @packageDocumentation
 * @module api-executor
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供基于 API 元数据与 CacheConfig 的带缓存执行器
 */

import type { API } from "@/types/api";
import type { RequestContext } from "./request";
import type { CacheConfig } from "./cache";
import { getFromCache, setCache } from "./cache";

/**
 * @function executeApiWithCache
 * @description 使用 API 元数据中的缓存配置执行处理逻辑（自动处理缓存读写）
 * @param {API} apiMeta - API 元数据（包含 cache 配置）
 * @param {RequestContext} ctx - 请求上下文
 * @param {() => Promise<T>} handler - 实际业务处理函数（未命中缓存时调用）
 * @returns {Promise<T>} 结果（可能来自缓存，也可能来自 handler）
 */
export async function executeApiWithCache<T>(
  apiMeta: API,
  ctx: RequestContext,
  handler: () => Promise<T>,
): Promise<T> {
  const cacheCfg: CacheConfig | undefined = apiMeta.cache;

  // 未配置缓存或未启用，直接执行业务
  if (!cacheCfg || !cacheCfg.enabled) {
    return handler();
  }

  const cacheCtx = buildCacheContext(ctx);

  // 1. 尝试从缓存读取
  const cached = getFromCache<T>(cacheCfg, cacheCtx);
  if (cached !== undefined) {
    return cached;
  }

  // 2. 未命中缓存，执行业务
  const result = await handler();

  // 3. 写入缓存
  setCache<T>(cacheCfg, cacheCtx, result);

  return result;
}

/**
 * @function buildCacheContext
 * @description 将 RequestContext 转换为缓存模块需要的上下文对象
 * @param {RequestContext} ctx - 请求上下文
 * @param {string} [project] - 可选项目标识
 * @returns {Record<string, unknown>} 缓存上下文（供 key.ts 使用）
 */
function buildCacheContext(ctx: RequestContext, project?: string): Record<string, unknown> {
  const base: Record<string, unknown> = {
    method: ctx.method,
    path: ctx.path,
    query: ctx.query,
    params: ctx.params,
    body: ctx.body,
    userId: ctx.userId,
  };

  if (project) {
    base.project = project;
  }

  return base;
}
