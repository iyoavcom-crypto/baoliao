/**
 * @packageDocumentation
 * @module api-config-loader-create
 * @since 1.0.0 (2025-11-15)
 * @author Z-kali
 * @description 从 JSON 动态加载并校验 API 元数据 (src/api/api.loader.ts)
 * @see src/api/config/loader/create.ts
 */

import type { API, APICollectionConfig } from "@/types/api";
import { validateApi } from "./validate";



/**
 * @function createApisFromJson
 * @description 将任意 JSON 数据转换为 API 数组，并做基础校验
 * @param {unknown} json - JSON 原始数据
 * @returns {API[]} API 配置数组
 */
export function createApisFromJson(json: unknown, collectionConfig?: APICollectionConfig): API[] {
  if (!Array.isArray(json)) {
    throw new Error("API 配置必须是数组");
  }

  const apis = json.map((item, index) => validateApi(item, index));

  const seen = new Set<string>();
  for (const a of apis) {
    if (seen.has(a.id)) throw new Error(`API 重复 id: ${a.id}`);
    seen.add(a.id);
  }

  if (collectionConfig?.fieldSelect?.enabled) {
    const white = collectionConfig.fieldSelect.whitelist;
    apis.forEach((a) => {
      if (!a.fields && Array.isArray(white) && white.length > 0) {
        a.fields = white;
      }
    });
  }

  return apis;
}