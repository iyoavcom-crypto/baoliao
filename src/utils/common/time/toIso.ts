/**
 * @packageDocumentation
 * @module field/time
 * @since 1.0.0 (2025-11-04)
 * @author Z-kali
 * @description 时间工具：通用时间转 ISO、日期字符串转 ISO（UTC 00:00:00）
 */

/**
 * @function toIso
 * @description 将任意可识别时间转为 ISO 字符串（用于日志/数据库），非法输入返回 "Invalid Date"
 * @param {Date|string|number} input - 时间输入
 * @returns {string} ISO 字符串
 */
export function toIso(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? "Invalid Date" : date.toISOString();
}

export const toISO = toIso;

/**
 * @function toIsoDate
 * @description 将 "YYYY-MM-DD" 明确转换为 ISO 字符串（UTC 00:00:00）
 * @param {string} input - 日期字符串（格式："YYYY-MM-DD"）
 * @returns {string} ISO 时间字符串
 * @example
 * toIsoDate("2025-11-06") => "2025-11-06T00:00:00.000Z"
 */
export function toIsoDate(input: string): string {
  if (typeof input !== "string") return "Invalid Date";

  const normalized = input.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!m) return "Invalid Date";

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d, 0, 0, 0, 0));

  return Number.isNaN(date.getTime()) ? "Invalid Date" : date.toISOString();
}

export const toISODate = toIsoDate;
