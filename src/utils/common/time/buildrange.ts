/**
 * @packageDocumentation
 * @module field/time
 * @since 1.0.0 (2025-11-04)
 * @author Z-kali
 * @description 构建并规范化日期区间
 */

import { ensureDate } from "./ensuredate";

export type DateRange = { from: Date; to: Date };

/**
 * @function buildRange
 * @description 规范化区间顺序，并截断到毫秒精度
 * @param {Date|string|number} a - 起点或终点
 * @param {Date|string|number} b - 起点或终点
 * @returns {DateRange} 规范化后的区间对象
 */
export function buildRange(a: Date | string | number, b: Date | string | number): DateRange {
  const da = ensureDate(a);
  const db = ensureDate(b);
  const [from, to] = da.getTime() <= db.getTime() ? [da, db] : [db, da];
  return { from: new Date(from.getTime()), to: new Date(to.getTime()) };
}