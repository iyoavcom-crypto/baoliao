/**
 * @packageDocumentation
 * @module query
 * @since 1.0.0 (2025-01-07)
 * @author Z-kali
 * @description Logic for applying filters to a where clause
 */

import { Op } from "sequelize";
import type { FilterValue } from "./types.js";
import { isValidComparableValue } from "./internal-utils.js";

/**
 * @function applyFilters
 * @description 将 filters 条件应用到 where 对象，支持 FilterValue 结构与数组/原始值形式
 * @param {Record<string, unknown>} where - 可变的 where 条件对象（输出参数）
 * @param {Record<string, unknown>} [filters] - 过滤条件对象，键为字段名，值支持 FilterValue/数组/原始值
 * @returns {void} 无返回值，通过修改 where 对象产生副作用
 * @throws {Error}
 *  - 当过滤字段名为空或不是字符串时抛出错误
 *  - 当比较操作符的值类型非法（如 gt/gte/lt/lte 不是 number/string/Date）时抛出错误
 *  - 当 like 值不是字符串时抛出错误
 *  - 当 in/notIn 值不是数组时抛出错误
 *  - 当数组过滤值为空数组时抛出错误
 */
export function applyFilters(
  where: Record<string, unknown>,
  filters?: Record<string, unknown>,
): void {
  for (const [k, v] of Object.entries(filters || {})) {
    if (v == null) continue;
    if (typeof k !== "string" || k.trim() === "") {
      throw new Error(`Invalid filter field name: ${k}`);
    }

    if (typeof v === "object" && !Array.isArray(v)) {
      const clause: Record<symbol, unknown> = {};
      const filterValue = v as FilterValue;

      if (filterValue.gt !== undefined && !isValidComparableValue(filterValue.gt)) {
        throw new Error(
          `Invalid value for 'gt' operator in field '${k}': must be number, string, or Date`,
        );
      }
      if (filterValue.gte !== undefined && !isValidComparableValue(filterValue.gte)) {
        throw new Error(
          `Invalid value for 'gte' operator in field '${k}': must be number, string, or Date`,
        );
      }
      if (filterValue.lt !== undefined && !isValidComparableValue(filterValue.lt)) {
        throw new Error(
          `Invalid value for 'lt' operator in field '${k}': must be number, string, or Date`,
        );
      }
      if (filterValue.lte !== undefined && !isValidComparableValue(filterValue.lte)) {
        throw new Error(
          `Invalid value for 'lte' operator in field '${k}': must be number, string, or Date`,
        );
      }
      if (filterValue.like !== undefined && typeof filterValue.like !== "string") {
        throw new Error(
          `Invalid value for 'like' operator in field '${k}': must be string`,
        );
      }
      if (filterValue.prefix !== undefined && typeof filterValue.prefix !== "string") {
        throw new Error(
          `Invalid value for 'prefix' operator in field '${k}': must be string`,
        );
      }
      if (filterValue.prefixList !== undefined && !Array.isArray(filterValue.prefixList)) {
        throw new Error(
          `Invalid value for 'prefixList' operator in field '${k}': must be array`,
        );
      }
      if (filterValue.in !== undefined && !Array.isArray(filterValue.in)) {
        throw new Error(
          `Invalid value for 'in' operator in field '${k}': must be array`,
        );
      }
      if (filterValue.notIn !== undefined && !Array.isArray(filterValue.notIn)) {
        throw new Error(
          `Invalid value for 'notIn' operator in field '${k}': must be array`,
        );
      }

      if (filterValue.eq !== undefined) clause[Op.eq] = filterValue.eq;
      if (filterValue.ne !== undefined) clause[Op.ne] = filterValue.ne;
      if (filterValue.gt !== undefined) clause[Op.gt] = filterValue.gt;
      if (filterValue.gte !== undefined) clause[Op.gte] = filterValue.gte;
      if (filterValue.lt !== undefined) clause[Op.lt] = filterValue.lt;
      if (filterValue.lte !== undefined) clause[Op.lte] = filterValue.lte;
      if (filterValue.like !== undefined) clause[Op.like] = `%${filterValue.like}%`;
      if (filterValue.prefix !== undefined) clause[Op.like] = `${filterValue.prefix}%`;
      if (filterValue.in !== undefined) clause[Op.in] = filterValue.in;
      if (filterValue.notIn !== undefined) clause[Op.notIn] = filterValue.notIn;

      if (filterValue.prefixList !== undefined && Array.isArray(filterValue.prefixList) && filterValue.prefixList.length > 0) {
        const whereClause = where as Record<symbol, unknown>;
        const existing = whereClause[Op.or] as unknown;
        const existingArr = Array.isArray(existing) ? (existing as unknown[]) : [];
        const orClauses = filterValue.prefixList.map((p) => ({ [k]: { [Op.like]: `${String(p)}%` } }));
        whereClause[Op.or] = [...existingArr, ...orClauses] as unknown;
      } else {
        if (Object.keys(clause).length) {
          where[k] = clause as unknown;
        }
      }
    } else if (Array.isArray(v)) {
      if (v.length === 0) {
        throw new Error(`Empty array not allowed for field '${k}'`);
      }
      where[k] = { [Op.in]: v } as unknown;
    } else {
      where[k] = v as unknown;
    }
  }
}
