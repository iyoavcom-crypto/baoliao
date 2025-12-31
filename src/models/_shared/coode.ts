/**
 * @packageDocumentation
 * @module column-helpers/coode
 * @author Z-kali
 */

import { DataTypes, type Model, type ModelAttributeColumnOptions } from "sequelize";

/**
 * @interface CoodeColumnOptions
 * @description 代码(Coode)字段配置
 * @property {string} columnName - 模型字段名 / 数据库列名
 * @property {boolean} allowNull - 是否允许为 NULL
 * @property {string} comment - 字段注释
 * @property {string} [defaultValue] - 默认值
 * @property {number} [length] - 字符串长度限制 (默认 255)
 * @property {boolean} [unique] - 是否唯一
 * @property {boolean} [upperCase] - 是否强制大写
 */
export interface CoodeColumnOptions<M extends Model> {
  columnName: keyof M & string;
  allowNull: boolean;
  comment: string;
  defaultValue?: string;
  length?: number;
  unique?: boolean;
  upperCase?: boolean;
}

/**
 * @function createCoodeColumn
 * @description 创建代码(Coode)字段的 Sequelize 列定义
 * @template M
 * @param {CoodeColumnOptions<M>} options - 字段配置
 * @returns {ModelAttributeColumnOptions<M>} Sequelize 列定义
 */
export function createCoodeColumn<M extends Model>(
  options: CoodeColumnOptions<M>,
): ModelAttributeColumnOptions<M> {
  const { columnName, allowNull, comment, defaultValue, length = 255, unique = false, upperCase = false } = options;

  return {
    type: DataTypes.STRING(length),
    allowNull,
    defaultValue,
    unique,
    comment,
    set(this: M, value: string | null | undefined) {
      if (value === undefined || value === null) {
        this.setDataValue(columnName as never, null as unknown as never);
        return;
      }
      let str = String(value).trim();
      if (upperCase) {
        str = str.toUpperCase();
      }
      this.setDataValue(columnName as never, str as unknown as never);
    },
  } satisfies ModelAttributeColumnOptions<M>;
}