/**
 * @packageDocumentation
 * @module query
 * @since 1.0.0 (2025-01-07)
 * @author Z-kali
 * @description Internal utility functions for query module
 */

/**
 * @function validateSearchFields
 * @description 校验模糊搜索字段列表，确保为非空字符串数组；非法时抛出错误
 * @param {string[]} [fields] - 待校验的字段名数组
 * @returns {string[]} 校验通过后的字段名数组；若入参为 undefined 则返回空数组
 * @throws {Error} 当字段列表不是数组或包含空字符串/非字符串元素时抛出错误
 */
export function validateSearchFields(fields?: string[]): string[] {
  if (fields === undefined) return [];
  if (!Array.isArray(fields)) {
    throw new Error("SearchFields must be an array");
  }
  for (const field of fields) {
    if (typeof field !== "string" || field.trim() === "") {
      throw new Error(`Invalid search field: ${field}`);
    }
  }
  return fields;
}

/**
 * @function isValidComparableValue
 * @description 验证值是否可用于比较操作（>, >=, <, <=），限制为 number/string/Date
 * @param {unknown} value - 待验证的值
 * @returns {boolean} 当值为 number、string 或 Date 实例时返回 true，否则返回 false
 */
export function isValidComparableValue(value: unknown): value is number | string | Date {
  return typeof value === "number" || typeof value === "string" || value instanceof Date;
}
