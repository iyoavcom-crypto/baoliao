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
