/**
 * @packageDocumentation
 * @module field/time
 * @since 1.0.0 (2025-11-04)
 * @author Z-kali
 * @description 严格解析日期，失败抛错
 */

import { parseDateSafe } from "./parsedatesafe";

/**
 * @function ensureDate
 * @description 解析失败则抛 RangeError（严格场景使用）
 * @param {Date|string|number} input - 日期输入
 * @returns {Date} 解析后的 Date
 * @throws {RangeError} 非法日期
 */
export function ensureDate(input: Date | string | number): Date {
  const d = parseDateSafe(input);
  if (!d) throw new RangeError("Invalid Date");
  return d;
}