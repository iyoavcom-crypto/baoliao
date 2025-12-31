/**
 * @packageDocumentation
 * @module dto/system/feature/audit
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 功能审计相关数据传输对象
 */

/**
 * @interface FeatureAuditLogListDto
 * @description 功能审计日志列表项
 * @property {number} id - 日志ID
 * @property {string} featureKey - 功能键
 * @property {'create' | 'update' | 'delete'} action - 操作类型
 * @property {string | null} oldValue - 旧值（JSON）
 * @property {string | null} newValue - 新值（JSON）
 * @property {string} operatorId - 操作员ID
 * @property {Date} createdAt - 创建时间
 */
export interface FeatureAuditLogListDto {
  id: number;
  featureKey: string;
  action: 'create' | 'update' | 'delete';
  oldValue: string | null;
  newValue: string | null;
  operatorId: string;
  createdAt: Date;
}

/**
 * @interface FeatureAuditLogDetailDto
 * @description 功能审计日志详情
 * @property {number} id - 日志ID
 * @property {string} featureKey - 功能键
 * @property {'create' | 'update' | 'delete'} action - 操作类型
 * @property {string | null} oldValue - 旧值（JSON）
 * @property {string | null} newValue - 新值（JSON）
 * @property {string} operatorId - 操作员ID
 * @property {Date} createdAt - 创建时间
 */
export interface FeatureAuditLogDetailDto {
  id: number;
  featureKey: string;
  action: 'create' | 'update' | 'delete';
  oldValue: string | null;
  newValue: string | null;
  operatorId: string;
  createdAt: Date;
}

/**
 * @interface FeatureAuditLogCreatableDto
 * @description 功能审计日志可创建字段
 * @property {string} featureKey - 功能键
 * @property {'create' | 'update' | 'delete'} action - 操作类型
 * @property {string} oldValue - 旧值（JSON）
 * @property {string} newValue - 新值（JSON）
 */
export interface FeatureAuditLogCreatableDto {
  featureKey: string;
  action: 'create' | 'update' | 'delete';
  oldValue?: string;
  newValue?: string;
}
