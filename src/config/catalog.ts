/**
 * @packageDocumentation
 * @module api-config-catalog
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供 API 元数据相关类型定义、运行时常量及多维索引构建工具。
 * @see src/api/config/catalog.ts
 */

import { createApisFromJson } from "./loader";
import type { API, FieldSelectConfig, HttpMethod } from "@/types/api";
import fs from "fs";
import path from "path";

/**
 * @constant defaultFieldSelect
 * @description 默认字段选择器配置（开启状态）
 */
const defaultFieldSelect: FieldSelectConfig = { enabled: true, param: "fields", whitelist: [] };

/**
 * @function loadApiConfigs
 * @description 动态加载 data/api 目录下的所有 JSON 配置文件
 * @returns {unknown[]} 所有 API 配置的原始数据
 */
function loadApiConfigs(): unknown[] {
  const apiConfigDir = path.join(process.cwd(), "data", "api");
  const configs: unknown[] = [];

  try {
    // 检查目录是否存在
    if (!fs.existsSync(apiConfigDir)) {
      console.warn(`[API Catalog] API config directory not found: ${apiConfigDir}`);
      return configs;
    }

    // 读取目录下的所有 .json 文件
    const files = fs.readdirSync(apiConfigDir)
      .filter(file => file.endsWith('.json') && !file.endsWith('.example'));

    // 加载每个 JSON 文件
    for (const file of files) {
      try {
        const filePath = path.join(apiConfigDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
          configs.push(...data);
        } else {
          configs.push(data);
        }
        
        console.log(`[API Catalog] Loaded API config from: ${file}`);
      } catch (error) {
        console.error(`[API Catalog] Failed to load ${file}:`, error);
      }
    }

    console.log(`[API Catalog] Total loaded ${configs.length} API configs from ${files.length} files`);
  } catch (error) {
    console.error('[API Catalog] Failed to load API configs:', error);
  }

  return configs;
}

/**
 * @constant allApis
 * @description 所有 API 元数据实例集，通过动态加载 JSON 数据源构建而来
 */
const combined = loadApiConfigs();
export const allApis: API[] = createApisFromJson(combined, { fieldSelect: defaultFieldSelect });

/**
 * @function reloadApiConfigs
 * @description 重新加载 API 配置(热重载支持)
 * @returns {API[]} 新的 API 配置数组
 */
export function reloadApiConfigs(): API[] {
  const configs = loadApiConfigs();
  return createApisFromJson(configs, { fieldSelect: defaultFieldSelect });
}

/**
 * @constant apisById
 * @description 基于 API.id 的索引映射表（只读）
 */
export const apisById: ReadonlyMap<string, API> = new Map(allApis.map((a) => [a.id, a]));

/**
 * @constant apisByMethodPath
 * @description 基于 “method + path” 的多值索引映射表（如：GET /user）
 */
export const apisByMethodPath: ReadonlyMap<string, API[]> = new Map(
  allApis
    .flatMap((a) => a.paths.map((p: string) => ({ k: `${a.method} ${p}`, a })))
    .reduce((acc, cur) => {
      const arr = acc.get(cur.k) ?? [];
      arr.push(cur.a);
      acc.set(cur.k, arr);
      return acc;
    }, new Map<string, API[]>()),
);

/**
 * @constant apisByRole
 * @description 基于 role（权限角色）的多值索引映射表（小写标准化处理）
 */
export const apisByRole: ReadonlyMap<string, API[]> = new Map(
  allApis
    .flatMap((a) => a.roles.map((r: string) => ({ r, a })))
    .reduce((acc, cur) => {
      const key = cur.r.toLowerCase();
      const arr = acc.get(key) ?? [];
      arr.push(cur.a);
      acc.set(key, arr);
      return acc;
    }, new Map<string, API[]>()),
);

/**
 * @constant apisByModel
 * @description 基于 model（业务模型标识）的多值索引映射表
 */
export const apisByModel: ReadonlyMap<string, API[]> = new Map(
  allApis
    .flatMap((a) => a.models.map((m: string) => ({ m, a })))
    .reduce((acc, cur) => {
      const key = cur.m;
      const arr = acc.get(key) ?? [];
      arr.push(cur.a);
      acc.set(key, arr);
      return acc;
    }, new Map<string, API[]>()),
);

/**
 * @constant apisByPath
 * @description 基于单 path 的多值索引映射表，不区分 HTTP 方法
 */
export const apisByPath: ReadonlyMap<string, API[]> = new Map(
  allApis
    .flatMap((a) => a.paths.map((p: string) => ({ p, a })))
    .reduce((acc, cur) => {
      const arr = acc.get(cur.p) ?? [];
      arr.push(cur.a);
      acc.set(cur.p, arr);
      return acc;
    }, new Map<string, API[]>()),
);

/**
 * @function getApisByRole
 * @description 根据角色（不区分大小写）获取对应 API 列表
 * @param {string} role - 权限角色标识
 * @returns {API[]} 匹配角色的 API 列表，如无则返回空数组
 */
export function getApisByRole(role: string): API[] {
  return apisByRole.get(role.toLowerCase()) ?? [];
}

/**
 * @function getApisByModel
 * @description 根据业务模型标识获取 API 列表
 * @param {string} model - 模型名称
 * @returns {API[]} 匹配模型的 API 列表，如无则返回空数组
 */
export function getApisByModel(model: string): API[] {
  return apisByModel.get(model) ?? [];
}

/**
 * @function getApisByMethodPath
 * @description 根据 HTTP 方法与路径组合获取 API 列表
 * @param {HttpMethod} method - HTTP 方法
 * @param {string} path - API 路径
 * @returns {API[]} 匹配 method+path 的 API 列表，如无则返回空数组
 */
export function getApisByMethodPath(method: HttpMethod, path: string): API[] {
  return apisByMethodPath.get(`${method} ${path}`) ?? [];
}

/**
 * @function getApiById
 * @description 根据 API ID 获取单个 API
 * @param {string} id - API 唯一标识
 * @returns {API | undefined} API 对象,如果不存在返回 undefined
 */
export function getApiById(id: string): API | undefined {
  return apisById.get(id);
}
