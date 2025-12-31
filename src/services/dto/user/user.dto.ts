/**
 * @packageDocumentation
 * @module dto/user/user
 * @since 1.0.0 (2025-12-26)
 * @author Z-kali
 * @description 用户数据传输对象，处理通信层与模型层之间的字段映射
 */

import type { UserState } from "@/constants/index.js";

/**
 * @interface UserListDto
 * @description 用户列表项
 * @property {string} id - 用户ID
 * @property {string | null} pid - 父级ID
 * @property {string | null} name - 昵称
 * @property {string} phone - 手机号
 * @property {UserState} state - 用户状态
 * @property {string} roleId - 角色ID
 * @property {boolean} vip - 是否VIP
 * @property {string | null} avatar - 头像
 * @property {boolean} longSession - 是否长期登录
 * @property {Date | null} lastOnlineAt - 最后在线时间
 * @property {Date} createdAt - 创建时间
 */
export interface UserListDto {
  id: string;
  pid: string | null;
  type: 'employee' | 'user';  // ✅ 新增
  name: string | null;
  phone: string;
  state: UserState;
  roleId: string;
  vip: boolean;
  avatar: string | null;
  longSession: boolean;
  lastOnlineAt: Date | null;
  createdAt: Date;
}

/**
 * @interface UserDetailDto
 * @description 用户详情
 * @property {string} id - 用户ID
 * @property {string | null} name - 昵称
 * @property {UserState} state - 用户状态
 * @property {string} roleId - 角色ID
 * @property {boolean} vip - 是否VIP
 * @property {string | null} ip - 最近登录IP
 * @property {string | null} ua - 最近登录UA
 * @property {string | null} avatar - 头像
 * @property {boolean} longSession - 是否长期登录
 * @property {Date | null} lastOnlineAt - 最后在线时间
 * @property {Date} createdAt - 创建时间
 */
export interface UserDetailDto {
  id: string;
  type: 'employee' | 'user';              // ✅ 新增
  pid: string | null;                      // ✅ 新增
  name: string | null;
  phone: string;                          // ✅ 新增
  state: UserState;
  roleId: string;
  vip: boolean;
  twoFactorEnabled: boolean;              // ✅ 新增
  telegramId: string | null;              // ✅ 新增
  teamId: string | null;                  // ✅ 新增
  ip: string | null;
  ua: string | null;
  avatar: string | null;
  longSession: boolean;
  passwordUpdatedAt: Date | null;         // ✅ 新增
  lastLoginAt: Date | null;               // ✅ 新增
  lastOnlineAt: Date | null;
  createdAt: Date;
  updatedAt: Date;                        // ✅ 新增
}

/**
 * @interface UserUpdatableDto
 * @description 用户可更新字段
 * @property {UserState} state - 用户状态
 * @property {string} roleId - 角色ID
 * @property {string | null} name - 昵称
 * @property {string | null} avatar - 头像
 * @property {boolean} vip - 是否VIP
 * @property {boolean} longSession - 是否长期登录
 */
export interface UserUpdatableDto {
  state?: UserState;
  roleId?: string;
  name?: string | null;
  avatar?: string | null;
  vip?: boolean;
  longSession?: boolean;
}

/**
 * @interface UserCreatableDto
 * @description 用户可创建字段
 * @property {UserState} state - 用户状态
 * @property {string} phone - 手机号
 * @property {string} password - 密码
 * @property {string} roleId - 角色ID
 * @property {string | null} name - 昵称
 * @property {string | null} avatar - 头像
 * @property {boolean} longSession - 是否长期登录
 */
export interface UserCreatableDto {
  state: UserState;
  phone: string;
  password: string;
  roleId: string;
  name?: string | null;
  avatar?: string | null;
  longSession?: boolean;
}
