/**
 * @packageDocumentation
 * @module column-helpers/progress
 * @author Z-kali
 */

import { DataTypes, type Model, type ModelAttributeColumnOptions } from "sequelize";

/**
 * @interface ProgressColumnOptions
 * @description 进度字段配置（范围 0-100）
 * @property {string} columnName - 模型字段名 / 数据库列名
 * @property {boolean} allowNull - 是否允许为 NULL
 * @property {string} comment - 字段注释
 * @property {number} [defaultValue] - 默认值
 * @property {boolean} [isInteger] - 是否为整数（默认为 false，即允许小数）
 */
export interface ProgressColumnOptions<M extends Model> {
  columnName: keyof M & string;
  allowNull: boolean;
  comment: string;
  defaultValue?: number;
  isInteger?: boolean;
}

/**
 * @function createProgressColumn
 * @description 创建进度字段的 Sequelize 列定义（数据库 FLOAT/INTEGER，范围 0-100）
 * @template M
 * @param {ProgressColumnOptions<M>} options - 字段配置
 * @returns {ModelAttributeColumnOptions<M>} Sequelize 列定义
 */
export function createProgressColumn<M extends Model>(
  options: ProgressColumnOptions<M>,
): ModelAttributeColumnOptions<M> {
  const { columnName, allowNull, comment, defaultValue, isInteger } = options;

  return {
    type: isInteger ? DataTypes.INTEGER : DataTypes.FLOAT,
    allowNull,
    defaultValue,
    comment: `${comment} (0 - 100)`,
    validate: {
      min: 0,
      max: 100,
      ...(isInteger ? { isInt: true } : {}),
    },
    get(this: M) {
      const val = this.getDataValue(columnName as never);
      if (val === null || val === undefined) return null;
      return Number(val);
    },
    set(this: M, value: number | null | undefined) {
      if (value === undefined || value === null) {
        this.setDataValue(columnName as never, null as unknown as never);
        return;
      }
      const num = Number(value);
      this.setDataValue(columnName as never, num as unknown as never);
    },
  } satisfies ModelAttributeColumnOptions<M>;
}
