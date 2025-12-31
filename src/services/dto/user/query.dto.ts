/**
 * @packageDocumentation
 * @module dto/user/query
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description User模块查询参数DTO
 */

import type { ListQueryDto, TimeRangeQueryDto } from "../common/query.dto.js";
import type { UserState } from "@/constants/index.js";

/**
 * @interface UserListQueryDto
 * @description 用户列表查询参数（继承通用查询参数）
 * @extends ListQueryDto
 * @extends TimeRangeQueryDto
 * 
 * 通用参数：
 * @property {number} [page] - 页码（从1开始）
 * @property {number} [size] - 每页数量
 * @property {string} [orderBy] - 排序字段
 * @property {"ASC" | "DESC"} [order] - 排序方向
 * @property {string} [keyword] - 关键字搜索（name/phone）
 * 
 * User特定参数：
 * @property {UserState} [state] - 用户状态
 * @property {string} [roleId] - 角色ID
 * @property {boolean} [vip] - VIP标识
 * @property {"employee" | "user"} [type] - 用户类型
 * @property {string} [phone] - 手机号
 * @property {string} [teamId] - 团队ID
 * @property {boolean} [online] - 是否在线
 */
export interface UserListQueryDto extends ListQueryDto, TimeRangeQueryDto {
  // 用户状态
  state?: UserState;
  roleId?: string;
  vip?: boolean;
  
  // 用户属性
  type?: "employee" | "user";
  phone?: string;
  teamId?: string;
  pid?: string;
  
  // 在线状态
  online?: boolean;
  lastOnlineFrom?: string | Date | number;
  lastOnlineTo?: string | Date | number;
  
  // 安全相关
  twoFactorEnabled?: boolean;
  longSession?: boolean;
}
