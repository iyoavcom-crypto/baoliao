/**
 * @packageDocumentation
 * @module dto/admin/safety/report
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 举报相关数据传输对象
 */

/**
 * @interface ReportListDto
 * @description 举报列表项
 * @property {number} id - 举报ID
 * @property {string} reporterId - 举报人ID
 * @property {'user' | 'group' | 'message'} targetType - 举报目标类型
 * @property {string} targetId - 举报目标ID
 * @property {string} reason - 举报原因
 * @property {'pending' | 'resolved' | 'rejected'} status - 状态
 * @property {Date} createdAt - 创建时间
 */
export interface ReportListDto {
  id: number;
  reporterId: string;
  targetType: 'user' | 'group' | 'message';
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: Date;
}

/**
 * @interface ReportDetailDto
 * @description 举报详情
 * @property {number} id - 举报ID
 * @property {string} reporterId - 举报人ID
 * @property {'user' | 'group' | 'message'} targetType - 举报目标类型
 * @property {string} targetId - 举报目标ID
 * @property {string} reason - 举报原因
 * @property {string | null} description - 详细描述
 * @property {'pending' | 'resolved' | 'rejected'} status - 状态
 * @property {string | null} result - 处理结果
 * @property {string | null} handlerId - 处理人ID
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface ReportDetailDto {
  id: number;
  reporterId: string;
  targetType: 'user' | 'group' | 'message';
  targetId: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'resolved' | 'rejected';
  result: string | null;
  handlerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface ReportCreatableDto
 * @description 举报可创建字段
 * @property {'user' | 'group' | 'message'} targetType - 举报目标类型
 * @property {string} targetId - 举报目标ID
 * @property {string} reason - 举报原因
 * @property {string} description - 详细描述
 */
export interface ReportCreatableDto {
  targetType: 'user' | 'group' | 'message';
  targetId: string;
  reason: string;
  description?: string;
}

/**
 * @interface ReportUpdatableDto
 * @description 举报可更新字段
 * @property {'pending' | 'resolved' | 'rejected'} status - 状态
 * @property {string} result - 处理结果
 */
export interface ReportUpdatableDto {
  status?: 'pending' | 'resolved' | 'rejected';
  result?: string;
}
