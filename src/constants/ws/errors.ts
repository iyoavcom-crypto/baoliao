/**
 * @packageDocumentation
 * @module constants/ws/errors
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 错误码定义
 */

/**
 * @constant WS_ERROR_CODES
 * @description WebSocket 错误码常量
 */
export const WS_ERROR_CODES = {
  // ==================== 认证相关 ====================
  /** 未认证 */
  UNAUTHORIZED: "UNAUTHORIZED",
  /** 认证失败 */
  AUTH_FAILED: "AUTH_FAILED",
  /** Token过期 */
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  /** Token无效 */
  INVALID_TOKEN: "INVALID_TOKEN",

  // ==================== 请求相关 ====================
  /** 无效的请求 */
  INVALID_REQUEST: "INVALID_REQUEST",
  /** 无效的消息格式 */
  INVALID_MESSAGE: "INVALID_MESSAGE",
  /** 未知的事件 */
  UNKNOWN_EVENT: "UNKNOWN_EVENT",
  /** 缺少必需参数 */
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // ==================== 权限相关 ====================
  /** 禁止访问 */
  FORBIDDEN: "FORBIDDEN",
  /** 不是会话成员 */
  NOT_MEMBER: "NOT_MEMBER",
  /** 不是群组成员 */
  NOT_GROUP_MEMBER: "NOT_GROUP_MEMBER",
  /** 权限不足 */
  PERMISSION_DENIED: "PERMISSION_DENIED",

  // ==================== 业务相关 ====================
  /** 会话不存在 */
  CONVERSATION_NOT_FOUND: "CONVERSATION_NOT_FOUND",
  /** 消息不存在 */
  MESSAGE_NOT_FOUND: "MESSAGE_NOT_FOUND",
  /** 用户不存在 */
  USER_NOT_FOUND: "USER_NOT_FOUND",
  /** 群组不存在 */
  GROUP_NOT_FOUND: "GROUP_NOT_FOUND",
  /** 好友关系不存在 */
  FRIEND_NOT_FOUND: "FRIEND_NOT_FOUND",

  /** 会话已存在 */
  CONVERSATION_EXISTS: "CONVERSATION_EXISTS",
  /** 好友关系已存在 */
  FRIEND_EXISTS: "FRIEND_EXISTS",
  /** 已经是好友 */
  ALREADY_FRIEND: "ALREADY_FRIEND",
  /** 申请不存在 */
  REQUEST_NOT_FOUND: "REQUEST_NOT_FOUND",
  /** 申请已处理 */
  REQUEST_ALREADY_HANDLED: "REQUEST_ALREADY_HANDLED",
  /** 已经是群成员 */
  ALREADY_MEMBER: "ALREADY_MEMBER",
  /** 群主不能退出 */
  OWNER_CANNOT_LEAVE: "OWNER_CANNOT_LEAVE",
  /** 不能踢出群主 */
  CANNOT_KICK_OWNER: "CANNOT_KICK_OWNER",

  /** 操作过于频繁 */
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // ==================== 系统相关 ====================
  /** 内部错误 */
  INTERNAL_ERROR: "INTERNAL_ERROR",
  /** 服务不可用 */
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  /** 服务器繁忙 */
  SERVER_BUSY: "SERVER_BUSY",

  // ==================== 成功响应 ====================
  /** 成功 */
  SUCCESS: "SUCCESS",
} as const;

/**
 * @type WsErrorCode
 * @description WebSocket 错误码类型
 */
export type WsErrorCode = typeof WS_ERROR_CODES[keyof typeof WS_ERROR_CODES];
