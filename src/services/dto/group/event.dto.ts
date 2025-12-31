/**
 * @packageDocumentation
 * @module dto/group/event
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 群组事件相关数据传输对象
 */

/**
 * @interface GroupEventListDto
 * @description 群组事件列表项
 * @property {number} id - 事件ID
 * @property {number} groupId - 群组ID
 * @property {string} operatorId - 操作人ID
 * @property {string} action - 操作类型（kick, mute, update_info等）
 * @property {string | null} targetId - 被操作人ID
 * @property {string | null} details - 详细信息（JSON）
 * @property {Date} createdAt - 创建时间
 */
export interface GroupEventListDto {
  id: number;
  groupId: number;
  operatorId: string;
  action: string;
  targetId: string | null;
  details: string | null;
  createdAt: Date;
}

/**
 * @interface GroupEventDetailDto
 * @description 群组事件详情
 * @property {number} id - 事件ID
 * @property {number} groupId - 群组ID
 * @property {string} operatorId - 操作人ID
 * @property {string} action - 操作类型（kick, mute, update_info等）
 * @property {string | null} targetId - 被操作人ID
 * @property {string | null} details - 详细信息（JSON）
 * @property {Date} createdAt - 创建时间
 */
export interface GroupEventDetailDto {
  id: number;
  groupId: number;
  operatorId: string;
  action: string;
  targetId: string | null;
  details: string | null;
  createdAt: Date;
}

/**
 * @interface GroupEventCreatableDto
 * @description 群组事件可创建字段
 * @property {number} groupId - 群组ID
 * @property {string} action - 操作类型
 * @property {string} targetId - 被操作人ID
 * @property {string} details - 详细信息（JSON）
 */
export interface GroupEventCreatableDto {
  groupId: number;
  action: string;
  targetId?: string;
  details?: string;
}
