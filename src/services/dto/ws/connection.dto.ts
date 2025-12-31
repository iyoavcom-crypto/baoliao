/**
 * @packageDocumentation
 * @module dto/ws/connection
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description WebSocket连接相关数据传输对象
 */

/**
 * @interface WsConnectionListDto
 * @description WebSocket连接列表项
 * @property {string} id - 连接ID
 * @property {string} userId - 用户ID
 * @property {string} deviceId - 设备ID
 * @property {string} socketId - SocketID
 * @property {string} nodeId - 节点ID
 * @property {Date} connectedAt - 连接时间
 */
export interface WsConnectionListDto {
  id: string;
  userId: string;
  deviceId: string;
  socketId: string;
  nodeId: string;
  connectedAt: Date;
}

/**
 * @interface WsConnectionDetailDto
 * @description WebSocket连接详情
 * @property {string} id - 连接ID
 * @property {string} userId - 用户ID
 * @property {string} deviceId - 设备ID
 * @property {string} socketId - SocketID
 * @property {string} nodeId - 节点ID
 * @property {Date} connectedAt - 连接时间
 */
export interface WsConnectionDetailDto {
  id: string;
  userId: string;
  deviceId: string;
  socketId: string;
  nodeId: string;
  connectedAt: Date;
}

/**
 * @interface WsConnectionCreatableDto
 * @description WebSocket连接可创建字段
 * @property {string} userId - 用户ID
 * @property {string} deviceId - 设备ID
 * @property {string} socketId - SocketID
 * @property {string} nodeId - 节点ID
 */
export interface WsConnectionCreatableDto {
  userId: string;
  deviceId: string;
  socketId: string;
  nodeId: string;
}
