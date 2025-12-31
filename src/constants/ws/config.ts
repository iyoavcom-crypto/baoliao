/**
 * @packageDocumentation
 * @module constants/ws/config
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 配置常量
 */

/**
 * @constant WS_CONFIG
 * @description WebSocket 服务器配置
 */
export const WS_CONFIG = {
  /** WebSocket 路径 */
  PATH: "/ws",

  /** 协议版本 */
  PROTOCOL_VERSION: "1.0",

  /** 心跳间隔（毫秒） */
  HEARTBEAT_INTERVAL: 30000,

  /** 连接超时时间（毫秒） */
  CONNECTION_TIMEOUT: 60000,

  /** 认证超时时间（毫秒） */
  AUTH_TIMEOUT: 10000,

  /** 最大连接数 */
  MAX_CONNECTIONS: 10000,

  /** 单用户最大设备数 */
  MAX_DEVICES_PER_USER: 5,

  /** 消息发送频率限制（次/秒） */
  MESSAGE_RATE_LIMIT: 10,

  /** 离线消息最大数量 */
  MAX_OFFLINE_MESSAGES: 100,
} as const;
