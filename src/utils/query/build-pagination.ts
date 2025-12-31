/**
 * @packageDocumentation
 * @module query
 * @since 1.0.0 (2025-01-07)
 * @author Z-kali
 * @description Logic for building pagination parameters
 */

import type { PaginationQuery, PaginationResult } from "./types.js";

/**
 * @function buildPagination
 * @description 构建标准分页参数，负责校验、归一化 page/limit，并计算 offset
 * @param {PaginationQuery} [q] - 分页查询参数（通常来源于 HTTP 查询串）
 * @returns {PaginationResult} 标准化后的分页结果对象
 * @throws {Error}
 *  - 当 page 非法（非正整数或无法解析为整数）时抛出错误
 *  - 当 limit 非法（非正整数或无法解析为整数）时抛出错误
 *  - 当 limit 超出上限 200 时抛出错误
 */
export function buildPagination({ page = 1, limit = 10 }: PaginationQuery = {}): PaginationResult {
  const pageNum = typeof page === "string" ? parseInt(page, 10) : Number(page);
  if (Number.isNaN(pageNum) || pageNum < 1) {
    throw new Error(`Invalid page number: ${page}. Page must be a positive integer.`);
  }

  const limitNum = typeof limit === "string" ? parseInt(limit, 10) : Number(limit);
  if (Number.isNaN(limitNum) || limitNum < 1) {
    throw new Error(`Invalid limit: ${limit}. Limit must be a positive integer.`);
  }

  if (limitNum > 200) {
    throw new Error(`Limit too large: ${limit}. Maximum allowed limit is 200.`);
  }

  const p = Math.max(1, pageNum);
  const l = Math.max(1, Math.min(200, limitNum));
  return { page: p, limit: l, offset: (p - 1) * l };
}
