/**
 * @packageDocumentation
 * @module query
 * @since 1.0.0 (2025-01-07)
 * @author Z-kali
 * @description Logic for applying search query to a where clause
 */

import { Op } from "sequelize";
import { validateSearchFields } from "./internal-utils.js";

/**
 * @function applySearch
 * @description 将关键字搜索条件应用到 where 对象，对指定字段生成 OR + LIKE 条件
 * @param {Record<string, unknown>} where - 可变的 where 条件对象（输出参数）
 * @param {string} [search] - 搜索关键字，若为空字符串或 undefined 则不生效
 * @param {string[]} [searchFields=[]] - 参与模糊搜索的字段列表，将为每个字段生成 LIKE 条件
 * @returns {void} 无返回值，通过修改 where 对象产生副作用
 * @throws {Error}
 *  - 当 search 存在但不是字符串时抛出错误
 *  - 当 searchFields 非合法字符串数组时抛出错误（委托 validateSearchFields 处理）
 */
export function applySearch(
  where: Record<string, unknown>,
  search?: string,
  searchFields: string[] = [],
): void {
  if (!search) return;
  if (search && typeof search !== "string") {
    throw new Error("Search parameter must be a string");
  }
  const fields = validateSearchFields(searchFields);
  if (!fields.length) return;
  const whereClause = where as Record<symbol, unknown>;
  whereClause[Op.or] = fields.map((f) => ({ [f]: { [Op.like]: `%${search}%` } }));
}
