/**
 * @packageDocumentation
 * @module column-helpers/options
 * @author Z-kali
 */

import { DataTypes, type Model, type ModelAttributeColumnOptions } from "sequelize";
import { createBracketStringListColumn } from "./bracket-string-list.js";

/**
 * @interface OptionColumnOptions
 * @description 单选字段配置
 * @property {string} columnName - 模型字段名 / 数据库列名
 * @property {readonly string[]} choices - 可选值列表
 * @property {boolean} allowNull - 是否允许为 NULL
 * @property {string} comment - 字段注释
 * @property {string} [defaultValue] - 默认值
 */
export interface OptionColumnOptions<M extends Model> {
  columnName: keyof M & string;
  choices: readonly string[];
  allowNull: boolean;
  comment: string;
  defaultValue?: string;
}

/**
 * @function createOptionColumn
 * @description 创建单选字段（基于 STRING，带 isIn 校验）
 * @template M
 * @param {OptionColumnOptions<M>} options - 字段配置
 * @returns {ModelAttributeColumnOptions<M>} Sequelize 列定义
 */
export function createOptionColumn<M extends Model>(
  options: OptionColumnOptions<M>,
): ModelAttributeColumnOptions<M> {
  const { choices, allowNull, comment, defaultValue } = options;

  return {
    type: DataTypes.STRING,
    allowNull,
    defaultValue,
    comment: `${comment} (可选值: ${choices.join(",")})`,
    validate: {
      isIn: {
        args: [choices as string[]],
        msg: `${comment} 值无效，必须为: ${choices.join(",")}`,
      },
    },
  } satisfies ModelAttributeColumnOptions<M>;
}

/**
 * @interface MultiOptionsColumnOptions
 * @description 多选字段配置
 * @property {string} columnName - 模型字段名 / 数据库列名
 * @property {readonly string[]} choices - 可选值列表
 * @property {boolean} allowNull - 是否允许为 NULL
 * @property {string} comment - 字段注释
 * @property {string[]} [defaultValue] - 默认值
 * @property {boolean} [nullableProperty] - 业务属性是否可选
 */
export interface MultiOptionsColumnOptions<M extends Model> {
  columnName: keyof M & string;
  choices: readonly string[];
  allowNull: boolean;
  comment: string;
  defaultValue?: string[] | undefined;
  nullableProperty?: boolean | undefined;
}

/**
 * @function createOptionsColumn
 * @description 创建多选字段（基于 bracket-string-list，带白名单过滤）
 * @template M
 * @param {MultiOptionsColumnOptions<M>} options - 字段配置
 * @returns {ModelAttributeColumnOptions<M>} Sequelize 列定义
 */
export function createOptionsColumn<M extends Model>(
  options: MultiOptionsColumnOptions<M>,
): ModelAttributeColumnOptions<M> {
  const { columnName, choices, allowNull, comment, defaultValue, nullableProperty } = options;

  return createBracketStringListColumn({
    columnName,
    allowNull,
    comment: `${comment} (可选值: ${choices.join(",")})`,
    whitelist: choices,
    defaultValue,
    nullableProperty,
  });
}
