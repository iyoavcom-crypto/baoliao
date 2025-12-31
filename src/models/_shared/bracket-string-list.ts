/**
 * @packageDocumentation
 * @module column-helpers/bracket-string-list
 * @author Z-kali
 */

import { DataTypes, type Model, type ModelAttributeColumnOptions } from "sequelize";

/**
 * @function parseBracketStringList
 * @description 解析形如 "[admin,user]" 的字符串为字符串数组
 * @param {string|null} raw - 原始字符串
 * @returns {string[]} 解析后的字符串数组
 */
export function parseBracketStringList(raw: string | null): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.length < 2 || trimmed === "[]") return [];

  const content = trimmed.slice(1, -1).trim();
  if (!content) return [];

  return content
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * @function formatBracketStringList
 * @description 将字符串数组格式化为形如 "[admin,user]" 的字符串
 * @param {string[]} list - 字符串数组
 * @returns {string} 格式化后的字符串
 */
export function formatBracketStringList(list: string[]): string {
  if (!list || list.length === 0) return "[]";
  return `[${list.join(",")}]`;
}

/**
 * @interface BracketStringListColumnOptions
 * @description 方括号字符串数组字段配置
 * @property {string} columnName - 模型字段名 / 数据库列名
 * @property {boolean} allowNull - 是否允许为 NULL
 * @property {string} comment - 字段注释
 * @property {boolean} [nullableProperty] - 业务属性是否可选（true: undefined 写入 NULL）
 * @property {readonly string[]} [whitelist] - 值白名单，若提供则 set 时会按白名单过滤
 * @property {string[]} [defaultValue] - 默认值
 */
export interface BracketStringListColumnOptions<M extends Model> {
  columnName: keyof M & string;
  allowNull: boolean;
  comment: string;
  nullableProperty?: boolean | undefined;
  whitelist?: readonly string[] | undefined;
  defaultValue?: string[] | undefined;
}

/**
 * @function createBracketStringListColumn
 * @description 创建方括号字符串数组字段的 Sequelize 列定义（数据库 TEXT，业务侧 string[]）
 * @template M
 * @param {BracketStringListColumnOptions<M>} options - 字段配置
 * @returns {ModelAttributeColumnOptions<M>} Sequelize 列定义
 */
export function createBracketStringListColumn<M extends Model>(
  options: BracketStringListColumnOptions<M>,
): ModelAttributeColumnOptions<M> {
  const { columnName, allowNull, comment, nullableProperty, whitelist, defaultValue } = options;

  const whitelistSet = whitelist ? new Set(whitelist) : undefined;

  // 格式化默认值
  const formattedDefaultValue = defaultValue ? formatBracketStringList(defaultValue) : undefined;

  return {
    type: DataTypes.TEXT,
    allowNull,
    comment,
    defaultValue: formattedDefaultValue,
    get(this: M) {
      const raw = this.getDataValue(columnName as never) as unknown as string | null;
      return parseBracketStringList(raw);
    },
    set(this: M, value: string[] | undefined) {
      if (value === undefined && nullableProperty) {
        this.setDataValue(columnName as never, null as unknown as never);
        return;
      }

      let list = value ?? [];

      if (whitelistSet) {
        list = list.filter((item) => whitelistSet.has(item));
      }

      const formatted = formatBracketStringList(list);
      this.setDataValue(columnName as never, formatted as unknown as never);
    },
  } satisfies ModelAttributeColumnOptions<M>;
}
