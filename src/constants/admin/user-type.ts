/**
 * @packageDocumentation
 * @module constants/user-type
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description
 * 用户类型常量定义。
 *
 * 用于区分系统中的用户身份类型，
 * 作为数据库字段、JWT 载荷、权限判断等场景的统一来源。
 *
 * 类型说明：
 * - employee：员工（内部用户）
 * - user：普通用户（外部用户）
 *
 * @see UserType
 */

/**
 * @const USER_TYPE
 * @description
 * 用户类型常量集合（Source of Truth）。
 *
 * 包含以下类型值：
 * - EMPLOYEE → "employee" ：员工（内部系统用户）
 * - USER     → "user"     ：普通用户（外部系统用户）
 */
export const USER_TYPE = {
  EMPLOYEE: "employee",
  USER: "user",
} as const;

/**
 * @type UserType
 * @description
 * 用户类型联合类型。
 *
 * 由 {@link USER_TYPE} 常量反推出，
 * 用于替代魔法字符串或 enum，确保类型与运行时值一致。
 */
export type UserType = typeof USER_TYPE[keyof typeof USER_TYPE];
