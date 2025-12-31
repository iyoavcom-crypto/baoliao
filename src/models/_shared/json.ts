/**
 * @packageDocumentation
 * @module column-helpers/json-text
 * @author Z-kali
 */

import { DataTypes, type Model, type ModelAttributeColumnOptions } from "sequelize";

/**
 * @function parseJson
 * @description 将字符串解析为泛型 JSON 对象（纯函数，无副作用）
 * @template T
 * @param {string|null} raw - 原始字符串
 * @returns {T|undefined} 解析后的对象
 * @example
 * // 将字符串解析为对象
 * const obj = parseJson<{ a: number }>("{\"a\":1}");
 * // 无效输入返回 undefined
 * const bad = parseJson<{ a: number }>("not-json");
 * @remarks 输入为 null/空串或解析失败时返回 undefined
 */
 export function parseJson<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    const obj = JSON.parse(raw) as T;
    return obj;
  } catch {
    return undefined;
  }
}

/**
 * @function formatJsonField
 * @description 将 JSON 对象序列化为字符串
 * @template T
 * @param {T|undefined} value - JSON 对象
 * @returns {string|null} 序列化后的字符串
 */
export function formatJsonField<T>(value: T | undefined): string | null {
  if (!value) return null;
  return JSON.stringify(value);
}

/**
 * @interface JsonTextColumnOptions
 * @description JSON 文本字段配置
 * @property {string} columnName - 模型字段名 / 数据库列名
 * @property {boolean} allowNull - 是否允许为 NULL
 * @property {string} comment - 字段注释
 */
export interface JsonTextColumnOptions<M extends Model> {
  columnName: keyof M & string;
  allowNull: boolean;
  comment: string;
}

/**
 * @function createJsonTextColumn
 * @description 创建 JSON 文本字段的 Sequelize 列定义（数据库 TEXT，业务侧为泛型对象）
 * @template M,T
 * @param {JsonTextColumnOptions<M>} options - 字段配置
 * @param {(raw:string|null)=>T|undefined} parse - 解析函数
 * @param {(value:T|undefined)=>string|null} format - 序列化函数
 * @returns {ModelAttributeColumnOptions<M>} Sequelize 列定义
 */
export function createJsonTextColumn<M extends Model, T>(
  options: JsonTextColumnOptions<M>,
  parse: (raw: string | null) => T | undefined,
  format: (value: T | undefined) => string | null,
): ModelAttributeColumnOptions<M> {
  const { columnName, allowNull, comment } = options;

  return {
    type: DataTypes.TEXT,
    allowNull,
    comment,
    get(this: M) {
      const raw = this.getDataValue(columnName as never) as unknown as string | null;
      return parse(raw);
    },
    set(this: M, value: T | undefined) {
      const formatted = format(value);
      this.setDataValue(columnName as never, formatted as unknown as never);
    },
  } satisfies ModelAttributeColumnOptions<M>;
}
