/**
 * @packageDocumentation
 * @module column-helpers/boolean
 * @author Z-kali
 */

/**
 * @function validateBoolean
 * @description 校验并转换布尔值
 * @param {unknown} value - 外部输入值
 * @returns {boolean} 转换后的布尔值
 * @throws {TypeError} 非法布尔值
 */
export function validateBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;

  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;

  throw new TypeError(`BOOLEAN 字段值无效：${value}`);
}
