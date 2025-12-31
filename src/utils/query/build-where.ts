/**
 * @packageDocumentation
 * @module query
 * @since 1.0.0 (2025-01-07)
 * @author Z-kali
 * @description Main entry point for building Sequelize where clauses
 */

import type { WhereOptions } from "sequelize";
import type { BuildWhereOptions } from "./types.js";
import { applyFilters } from "./apply-filters.js";
import { applySearch } from "./apply-search.js";

/**
 * @function buildWhere
 * @description 根据 filters 与 search 构建 Sequelize WhereOptions 条件对象，是查询构建的统一入口
 * @param {BuildWhereOptions} [options] - where 构建选项，包含过滤与搜索配置
 * @returns {WhereOptions} Sequelize where 条件对象，可直接用于 Model.findAll 等方法
 * @throws {Error}
 *  - 当 filters 中字段名或值格式无效时抛出错误
 *  - 当 search 或 searchFields 格式无效时抛出错误
 */
export function buildWhere({ filters = {}, search, searchFields = [] }: BuildWhereOptions = {}): WhereOptions {
  const where: Record<string, unknown> = {};
  applyFilters(where, filters);
  applySearch(where, search, searchFields);
  return where as WhereOptions;
}
