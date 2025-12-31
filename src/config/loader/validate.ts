/**
 * @packageDocumentation
 * @module api-config-loader-validate
 * @since 1.0.0 (2025-11-15)
 * @author Z-kali
 * @description 从 JSON 动态加载并校验 API 元数据 (src/api/api.loader.ts)
 * @see src/api/config/loader/validate.ts
 */
import type { API, HttpMethod, OperateEnum } from "@/types/api";
import { ALL_HTTP_METHODS, ALL_OPERATE_ENUMS } from "@/types/api";
import { normalizeCache, inferKeyFieldsFromTemplate } from "./cache";

/**
 * @function validateApi
 * @description 校验并转换单个 API 配置项
 * @param {unknown} item - 单条原始配置
 * @param {number} index - 下标（用于错误提示）
 * @returns {API} 校验通过的 API 对象
 */
export function validateApi(item: unknown, index: number): API {
  const prefix = `API[${index}]`;

  if (item === null || typeof item !== "object" || Array.isArray(item)) {
    throw new Error(`${prefix} 必须为对象`);
  }

  const obj = item as Record<string, unknown>;

  const id = ensureNonEmptyString(obj.id, `${prefix}.id`);
  const method = ensureHttpMethod(obj.method, `${prefix}.method`);
  const models = ensureStringArray(obj.models, `${prefix}.models`);
  const paths = ensureStringArray(obj.paths, `${prefix}.paths`);
  if (models.length === 0) {
    throw new Error(`${prefix}.models 至少包含一个模型`);
  }
  if (paths.length === 0) {
    throw new Error(`${prefix}.paths 至少包含一个路径`);
  }

  const roles = ensureStringArray(obj.roles, `${prefix}.roles`).map((role) =>
    role.toLowerCase(),
  );

  const operateEnum = ensureOperateEnum(
    obj.operateEnum,
    `${prefix}.operateEnum`,
  );

  const dto = Array.isArray(obj.dto)
    ? ensureStringArray(obj.dto, `${prefix}.dto`)
    : [];

  let api: API = {
    id,
    method,
    models,
    paths,
    roles,
    operateEnum,
    dto,
  };

  if ("fields" in obj && obj.fields !== undefined) {
    const rawFields = ensureStringArray(obj.fields, `${prefix}.fields`);
    const normalizedFields = rawFields
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (normalizedFields.length > 0) {
      api.fields = normalizedFields;
    }
  }

  if ("description" in obj && obj.description !== undefined) {
    api.description = ensureString(obj.description, `${prefix}.description`);
  }

  if ("cache" in obj && obj.cache !== undefined && obj.cache !== null && typeof obj.cache === "object") {
    const cacheRaw = obj.cache as Record<string, unknown>;
    api.cache = normalizeCache(cacheRaw, `${prefix}.cache`);
    const tpl = typeof cacheRaw.key === "string" ? String(cacheRaw.key) : undefined;
    if (tpl && api.cache) {
      const inferred = inferKeyFieldsFromTemplate(tpl);
      const merged = Array.from(new Set([...(api.cache.keyFields ?? []), ...inferred]));
      api.cache.keyFields = merged;
    }
  }

  // 顶层字段：enabled/keyFields 优先，规范化覆盖到 cache
  if ("enabled" in obj || "keyFields" in obj) {
    const enabledTop = "enabled" in obj ? Boolean((obj as Record<string, unknown>).enabled) : undefined;
    const keyFieldsTop = "keyFields" in obj && obj.keyFields !== undefined
      ? ensureStringArray((obj as Record<string, unknown>).keyFields, `${prefix}.keyFields`)
      : undefined;

    const base = api.cache ?? { enabled: false, keyFields: [] };
    const merged = {
      enabled: enabledTop ?? base.enabled,
      keyFields: keyFieldsTop ?? base.keyFields,
    } as Record<string, unknown>;

    api.cache = normalizeCache(merged, `${prefix}.cache`);
  }

  

  if ("authRequired" in obj && obj.authRequired !== undefined) {
    api.authRequired = Boolean(obj.authRequired);
  }

  if ("allowedSortFields" in obj && obj.allowedSortFields !== undefined) {
    const sortFields = ensureStringArray(obj.allowedSortFields, `${prefix}.allowedSortFields`);
    if (sortFields.length > 0) {
      api.allowedSortFields = sortFields;
    }
  }

  if ("defaultSortField" in obj && obj.defaultSortField !== undefined) {
    const defField = ensureString(obj.defaultSortField, `${prefix}.defaultSortField`).trim();
    if (defField.length > 0) {
      api.defaultSortField = defField;
    }
  }

  if (api.defaultSortField && api.allowedSortFields && api.allowedSortFields.length > 0) {
    if (!api.allowedSortFields.includes(api.defaultSortField)) {
      throw new Error(`${prefix}.defaultSortField 必须属于 allowedSortFields`);
    }
  }

  if (api.method === "GET" && api.cache?.enabled) {
    const hasPath = Array.isArray(api.cache.keyFields) && api.cache.keyFields.includes("path");
    if (!hasPath) {
      throw new Error(`${prefix}.cache.keyFields 必须包含 "path" (GET 缓存) - API ID: ${api.id}, keyFields: ${JSON.stringify(api.cache.keyFields)}`);
    }
    const kf = Array.isArray(api.cache.keyFields) ? api.cache.keyFields : [];
    const hasPage = kf.includes("query.page");
    const hasPageSize = kf.includes("query.pageSize");
    if (hasPage !== hasPageSize) {
      throw new Error(`${prefix}.cache.keyFields GET 分页键必须同时包含 query.page 与 query.pageSize`);
    }
  }

  return api;
}

/**
 * @function ensureString
 * @description 校验值为字符串
 * @param {unknown} value - 原始值
 * @param {string} path - 字段路径（用于错误信息）
 * @returns {string} 字符串值
 */
export function ensureString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new Error(`${path} 必须为字符串`);
  }
  return value;
}

/**
 * @function ensureNonEmptyString
 * @description 校验值为非空字符串
 * @param {unknown} value - 原始值
 * @param {string} path - 字段路径（用于错误信息）
 * @returns {string} 非空字符串值
 */
export function ensureNonEmptyString(value: unknown, path: string): string {
  const str = ensureString(value, path);
  if (str.trim().length === 0) {
    throw new Error(`${path} 必须为非空字符串`);
  }
  return str;
}

/**
 * @function ensureStringArray
 * @description 校验值为字符串数组（允许空数组）
 * @param {unknown} value - 原始值
 * @param {string} path - 字段路径（用于错误信息）
 * @returns {string[]} 字符串数组
 */
export function ensureStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${path} 必须为字符串数组`);
  }

  value.forEach((item, idx) => {
    if (typeof item !== "string") {
      throw new Error(`${path}[${idx}] 必须为字符串`);
    }
  });

  return value as string[];
}

/**
 * @function ensureHttpMethod
 * @description 校验并转换 HTTP 方法
 * @param {unknown} value - 原始值
 * @param {string} path - 字段路径（用于错误信息）
 * @returns {HttpMethod} 合法的 HttpMethod
 */
export function ensureHttpMethod(value: unknown, path: string): HttpMethod {
  if (typeof value !== "string") {
    throw new Error(`${path} 必须为字符串`);
  }

  if (!ALL_HTTP_METHODS.includes(value as HttpMethod)) {
    throw new Error(`${path} 不合法: ${value}`);
  }

  return value as HttpMethod;
}

/**
 * @function ensureOperateEnum
 * @description 校验并转换 OperateEnum
 * @param {unknown} value - 原始值
 * @param {string} path - 字段路径（用于错误信息）
 * @returns {OperateEnum} 合法的 OperateEnum
 */
export function ensureOperateEnum(value: unknown, path: string): OperateEnum {
  if (typeof value !== "string") {
    throw new Error(`${path} 必须为字符串`);
  }

  if (!ALL_OPERATE_ENUMS.includes(value as OperateEnum)) {
    throw new Error(`${path} 不合法: ${value}`);
  }

  return value as OperateEnum;
}