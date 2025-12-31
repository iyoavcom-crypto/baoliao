/**
 * @packageDocumentation
 * @module field/time
 * @since 1.0.0 (2025-11-04)
 * @author Z-kali
 * @description 格式化日期区间字符串（YYYY-MM-DD HH:mm:ss ~ ...）
 */

import { buildRange } from "./buildrange";

function pad(n: number): string { return n.toString().padStart(2, "0"); }
function fmt(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * @function formatRange
 * @description 将任意两端输入格式化为人类可读的区间字符串
 * @param {Date|string|number} a - 起点或终点
 * @param {Date|string|number} b - 起点或终点
 * @returns {string} 形如 "YYYY-MM-DD HH:mm:ss ~ YYYY-MM-DD HH:mm:ss"
 */
export function formatRange(a: Date | string | number, b: Date | string | number): string {
  const { from, to } = buildRange(a, b);
  return `${fmt(from)} ~ ${fmt(to)}`;
}