/**
 * @packageDocumentation
 * @module dto/system/feature/definition
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 功能定义相关数据传输对象
 */

/**
 * @interface FeatureDefinitionListDto
 * @description 功能定义列表项
 * @property {string} key - 功能键
 * @property {string} name - 功能名称
 * @property {string | null} description - 功能描述
 * @property {boolean} defaultValue - 默认值
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface FeatureDefinitionListDto {
  key: string;
  name: string;
  description: string | null;
  defaultValue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface FeatureDefinitionDetailDto
 * @description 功能定义详情
 * @property {string} key - 功能键
 * @property {string} name - 功能名称
 * @property {string | null} description - 功能描述
 * @property {boolean} defaultValue - 默认值
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface FeatureDefinitionDetailDto {
  key: string;
  name: string;
  description: string | null;
  defaultValue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface FeatureDefinitionCreatableDto
 * @description 功能定义可创建字段
 * @property {string} key - 功能键
 * @property {string} name - 功能名称
 * @property {string} description - 功能描述
 * @property {boolean} defaultValue - 默认值
 */
export interface FeatureDefinitionCreatableDto {
  key: string;
  name: string;
  description?: string;
  defaultValue?: boolean;
}

/**
 * @interface FeatureDefinitionUpdatableDto
 * @description 功能定义可更新字段
 * @property {string} name - 功能名称
 * @property {string} description - 功能描述
 * @property {boolean} defaultValue - 默认值
 */
export interface FeatureDefinitionUpdatableDto {
  name?: string;
  description?: string;
  defaultValue?: boolean;
}
