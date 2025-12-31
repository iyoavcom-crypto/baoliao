/**
 * @packageDocumentation
 * @module dto/user/device
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 用户设备相关数据传输对象
 */

/**
 * @interface DeviceListDto
 * @description 设备列表项
 * @property {string} id - 设备ID
 * @property {string} userId - 用户ID
 * @property {string} deviceId - 设备唯一标识
 * @property {string} platform - 平台
 * @property {boolean} isOnline - 是否在线
 * @property {Date | null} lastActiveAt - 最后活跃时间
 */
export interface DeviceListDto {
  id: string;
  userId: string;
  deviceId: string;
  platform: string;
  isOnline: boolean;
  lastActiveAt: Date | null;
}

/**
 * @interface DeviceDetailDto
 * @description 设备详情
 * @property {string} id - 设备ID
 * @property {string} userId - 用户ID
 * @property {string} deviceId - 设备唯一标识
 * @property {string} platform - 平台
 * @property {string | null} pushToken - 推送Token
 * @property {Date | null} lastActiveAt - 最后活跃时间
 * @property {boolean} isOnline - 是否在线
 * @property {Date} createdAt - 创建时间
 */
export interface DeviceDetailDto {
  id: string;
  userId: string;
  deviceId: string;
  platform: string;
  pushToken: string | null;
  lastActiveAt: Date | null;
  isOnline: boolean;
  createdAt: Date;
}

/**
 * @interface DeviceCreatableDto
 * @description 设备可创建字段
 * @property {string} deviceId - 设备唯一标识
 * @property {string} platform - 平台
 * @property {string} pushToken - 推送Token
 */
export interface DeviceCreatableDto {
  deviceId: string;
  platform: string;
  pushToken?: string;
}

/**
 * @interface DeviceUpdatableDto
 * @description 设备可更新字段
 * @property {string} pushToken - 推送Token
 * @property {boolean} isOnline - 是否在线
 * @property {Date} lastActiveAt - 最后活跃时间
 */
export interface DeviceUpdatableDto {
  pushToken?: string;
  isOnline?: boolean;
  lastActiveAt?: Date;
}
