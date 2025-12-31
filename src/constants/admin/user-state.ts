/**
 * @packageDocumentation
 * @module constants/user-state
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description
 * 用户状态常量定义。
 *
 * 用于描述用户账号在系统中的生命周期状态，
 * 作为数据库字段、业务校验、权限判断的统一来源。
 *
 * 状态说明：
 * - active：正常启用
 * - deleted：已删除（逻辑删除）
 * - banned：封禁（违规或风控）
 * - locked：锁定（安全原因，如多次失败）
 *
 * @see UserState
 */

/**
 * @const USER_STATE
 * @description
 * 用户状态常量集合（Source of Truth）。
 *
 * 包含以下状态值：
 * - ACTIVE  → "active"  ：正常启用状态，允许登录与业务操作
 * - DELETED → "deleted" ：已删除（逻辑删除），不可登录，仅用于历史数据保留
 * - BANNED  → "banned"  ：封禁状态，因违规或风控原因禁止使用
 * - LOCKED  → "locked"  ：锁定状态，通常由安全策略触发（如多次登录失败）
 */
export const USER_STATE = {
  ACTIVE: "active",
  DELETED: "deleted",
  BANNED: "banned",
  LOCKED: "locked",
} as const;

/**
 * @type UserState
 * @description
 * 用户状态联合类型。
 *
 * 由 {@link USER_STATE} 常量反推出，
 * 用于替代魔法字符串或 enum，确保类型与运行时值一致。
 */
export type UserState = typeof USER_STATE[keyof typeof USER_STATE];
