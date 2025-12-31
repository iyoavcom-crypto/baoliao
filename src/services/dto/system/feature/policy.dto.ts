/**
 * @packageDocumentation
 * @module dto/system/feature/policy
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 功能策略相关数据传输对象
 */

/**
 * @interface FeaturePolicyListDto
 * @description 功能策略列表项
 * @property {number} id - 策略ID
 * @property {string} featureKey - 功能键
 * @property {'global' | 'user' | 'role' | 'group'} targetType - 目标类型
 * @property {string} targetId - 目标ID
 * @property {boolean} enabled - 是否启用
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface FeaturePolicyListDto {
  id: number;
  featureKey: string;
  targetType: 'global' | 'user' | 'role' | 'group';
  targetId: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface FeaturePolicyDetailDto
 * @description 功能策略详情
 * @property {number} id - 策略ID
 * @property {string} featureKey - 功能键
 * @property {'global' | 'user' | 'role' | 'group'} targetType - 目标类型
 * @property {string} targetId - 目标ID
 * @property {boolean} enabled - 是否启用
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface FeaturePolicyDetailDto {
  id: number;
  featureKey: string;
  targetType: 'global' | 'user' | 'role' | 'group';
  targetId: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface FeaturePolicyCreatableDto
 * @description 功能策略可创建字段
 * @property {string} featureKey - 功能键
 * @property {'global' | 'user' | 'role' | 'group'} targetType - 目标类型
 * @property {string} targetId - 目标ID
 * @property {boolean} enabled - 是否启用
 */
export interface FeaturePolicyCreatableDto {
  featureKey: string;
  targetType: 'global' | 'user' | 'role' | 'group';
  targetId: string;
  enabled: boolean;
}

/**
 * @interface FeaturePolicyUpdatableDto
 * @description 功能策略可更新字段
 * @property {boolean} enabled - 是否启用
 */
export interface FeaturePolicyUpdatableDto {
  enabled?: boolean;
}
