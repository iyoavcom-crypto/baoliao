/**
 * @packageDocumentation
 * @module column-helpers/percentage
 * @author Z-kali
 */

import { DataTypes, type Model, type ModelAttributeColumnOptions } from "sequelize";

/**
 * @interface PercentageColumnOptions
 * @description 百分比字段配置（范围 0-1）
 * @property {string} columnName - 模型字段名 / 数据库列名
 * @property {boolean} allowNull - 是否允许为 NULL
 * @property {string} comment - 字段注释
 * @property {number} [defaultValue] - 默认值
 */
export interface PercentageColumnOptions<M extends Model> {
  columnName: keyof M & string;
  allowNull: boolean;
  comment: string;
  defaultValue?: number;
}

/**
 * @function createPercentageColumn
 * @description 创建百分比字段的 Sequelize 列定义（数据库 FLOAT，范围 0-1）
 * @template M
 * @param {PercentageColumnOptions<M>} options - 字段配置
 * @returns {ModelAttributeColumnOptions<M>} Sequelize 列定义
 */
export function createPercentageColumn<M extends Model>(
  options: PercentageColumnOptions<M>,
): ModelAttributeColumnOptions<M> {
  const { columnName, allowNull, comment, defaultValue } = options;

  return {
    type: DataTypes.FLOAT,
    allowNull,
    defaultValue,
    comment: `${comment} (0.0 - 1.0)`,
    validate: {
      min: 0,
      max: 1,
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
      // 强制转换为数字
      const num = Number(value);
      this.setDataValue(columnName as never, num as unknown as never);
    },
  } satisfies ModelAttributeColumnOptions<M>;
}
