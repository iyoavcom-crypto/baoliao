/**
 * @packageDocumentation
 * @module field/time
 * @since 1.0.0 (2025-11-04)
 * @author Z-kali
 * @description 安全解析日期输入
 */

/**
 * @function parseDateSafe
 * @description 宽容解析（Date/ISO/时间戳），失败返回 null
 * @param {Date|string|number} input - 日期输入
 * @returns {Date|null} 解析后的 Date 或 null
 */
export function parseDateSafe(input: Date | string | number): Date | null {
  const d = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}