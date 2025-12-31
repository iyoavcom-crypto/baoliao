/**
 * @packageDocumentation
 * @module api-config-field
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供 API 元数据相关类型定义与运行时常量
 * @see src/api/config/field.ts
 */

export interface FieldSelectConfig {
  enabled: boolean;
  param: string;
  whitelist: string[];
}

/**
 * @function createFieldSelector
 * @description 创建字段选择函数，用于解析 URL 查询中的字段并返回合法字段列表
 * @param {FieldSelectConfig} cfg - 字段选择配置
 * @returns {(query: URLSearchParams) => string[] | null} 字段列表（未开启或无参数时返回 null）
 */
export function createFieldSelector(cfg: FieldSelectConfig): (query: URLSearchParams) => string[] | null {
  return function selectFields(query: URLSearchParams): string[] | null {
    if (!cfg.enabled) return null;

    const raw = query.get(cfg.param);
    if (!raw) return null;

    const fields = raw
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (fields.length === 0) return null;

    const valid = fields.filter((f) => cfg.whitelist.includes(f));

    return valid.length > 0 ? valid : null;
  };
}
