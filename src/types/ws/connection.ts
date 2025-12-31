/**
 * @packageDocumentation
 * @module types/ws/connection
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 连接相关类型定义
 */

import type { WebSocket } from "ws";

/**
 * @interface SocketMeta
 * @description WebSocket 连接元数据
 */
export interface SocketMeta {
  /** 用户ID */
  userId: string;
  /** 设备ID */
  deviceId: string;
  /** 连接ID（数据库记录） */
  connId: string;
  /** 最后心跳时间 */
  lastPing: number;
  /** 是否已认证 */
  authenticated: boolean;
}

/**
 * @interface AuthenticatedWebSocket
 * @description 已认证的 WebSocket 连接
 */
export interface AuthenticatedWebSocket extends WebSocket {
  meta?: SocketMeta;
}
