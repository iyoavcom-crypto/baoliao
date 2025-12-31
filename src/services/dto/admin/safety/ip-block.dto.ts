/**
 * @packageDocumentation
 * @module dto/admin/safety/ip-block
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description IP/设备封禁相关数据传输对象
 */

/**
 * @interface IpBlockListDto
 * @description IP/设备封禁列表项
 * @property {number} id - 封禁ID
 * @property {'ip' | 'device'} type - 类型
 * @property {string} value - IP或设备ID
 * @property {string} reason - 封禁原因
 * @property {Date | null} expiresAt - 过期时间
 * @property {string} operatorId - 操作员ID
 * @property {Date} createdAt - 创建时间
 */
export interface IpBlockListDto {
  id: number;
  type: 'ip' | 'device';
  value: string;
  reason: string;
  expiresAt: Date | null;
  operatorId: string;
  createdAt: Date;
}

/**
 * @interface IpBlockDetailDto
 * @description IP/设备封禁详情
 * @property {number} id - 封禁ID
 * @property {'ip' | 'device'} type - 类型
 * @property {string} value - IP或设备ID
 * @property {string} reason - 封禁原因
 * @property {Date | null} expiresAt - 过期时间
 * @property {string} operatorId - 操作员ID
 * @property {Date} createdAt - 创建时间
 */
export interface IpBlockDetailDto {
  id: number;
  type: 'ip' | 'device';
  value: string;
  reason: string;
  expiresAt: Date | null;
  operatorId: string;
  createdAt: Date;
}

/**
 * @interface IpBlockCreatableDto
 * @description IP/设备封禁可创建字段
 * @property {'ip' | 'device'} type - 类型
 * @property {string} value - IP或设备ID
 * @property {string} reason - 封禁原因
 * @property {Date} expiresAt - 过期时间
 */
export interface IpBlockCreatableDto {
  type: 'ip' | 'device';
  value: string;
  reason: string;
  expiresAt?: Date;
}
