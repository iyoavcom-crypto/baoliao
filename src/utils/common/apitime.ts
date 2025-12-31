/**
 * @packageDocumentation
 * @module api/api.time
 * @since 1.0.0 (2025-11-16)
 * @description 时间单位常量定义（src/api/api.time.ts）
 * @author Z-kali
 */

/**
 * @constant SECOND
 * @description 1 秒
 */
export const SECOND = 1;

/**
 * @constant MINUTE
 * @description 1 分钟 = 60 秒
 */
export const MINUTE = 60 * SECOND;

/**
 * @constant HOUR
 * @description 1 小时 = 60 分钟
 */
export const HOUR = 60 * MINUTE;

/**
 * @constant DAY
 * @description 1 天 = 24 小时
 */
export const DAY = 24 * HOUR;

/**
 * @constant WEEK
 * @description 1 周 = 7 天
 */
export const WEEK = 7 * DAY;

/**
 * @constant MONTH
 * @description 30 天（业务约定）
 */
export const MONTH = 30 * DAY;

export function parseDuration(value: string | number): number {
  if (typeof value === "number") return value;
  const s = String(value).trim();
  if (!s) return 0;
  const match = s.match(/^([0-9]+)\s*(ms|[smhdw])$/i);
  if (!match) return Number(s) || 0;
  const numStr = match[1] ?? "";
  const unit = match[2]?.toLowerCase() ?? "";
  if (!numStr || !unit) return Number(s) || 0;
  const n = Number(numStr);
  switch (unit) {
    case "ms": return Math.floor(n / 1000);
    case "s": return n * SECOND;
    case "m": return n * MINUTE;
    case "h": return n * HOUR;
    case "d": return n * DAY;
    case "w": return n * WEEK;
    default: return n;
  }
}
