/**
 * @packageDocumentation
 * @module dto/group/capacity
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 群组容量相关数据传输对象
 */

/**
 * @interface GroupCapacityListDto
 * @description 群组容量变更列表项
 * @property {number} id - 记录ID
 * @property {number} groupId - 群组ID
 * @property {number} oldCapacity - 旧容量
 * @property {number} newCapacity - 新容量
 * @property {string | null} reason - 变更原因
 * @property {string} operatorId - 操作人ID
 * @property {Date} createdAt - 创建时间
 */
export interface GroupCapacityListDto {
  id: number;
  groupId: number;
  oldCapacity: number;
  newCapacity: number;
  reason: string | null;
  operatorId: string;
  createdAt: Date;
}

/**
 * @interface GroupCapacityDetailDto
 * @description 群组容量变更详情
 * @property {number} id - 记录ID
 * @property {number} groupId - 群组ID
 * @property {number} oldCapacity - 旧容量
 * @property {number} newCapacity - 新容量
 * @property {string | null} reason - 变更原因
 * @property {string} operatorId - 操作人ID
 * @property {Date} createdAt - 创建时间
 */
export interface GroupCapacityDetailDto {
  id: number;
  groupId: number;
  oldCapacity: number;
  newCapacity: number;
  reason: string | null;
  operatorId: string;
  createdAt: Date;
}

/**
 * @interface GroupCapacityCreatableDto
 * @description 群组容量变更可创建字段
 * @property {number} groupId - 群组ID
 * @property {number} oldCapacity - 旧容量
 * @property {number} newCapacity - 新容量
 * @property {string} reason - 变更原因
 */
export interface GroupCapacityCreatableDto {
  groupId: number;
  oldCapacity: number;
  newCapacity: number;
  reason?: string;
}
