/**
 * @packageDocumentation
 * @module dto/group/query
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description Group模块查询参数DTO
 */

import type { ListQueryDto, TimeRangeQueryDto } from "../common/query.dto.js";

/**
 * @interface GroupListQueryDto
 * @description 群组列表查询参数
 * @extends ListQueryDto
 * @extends TimeRangeQueryDto
 */
export interface GroupListQueryDto extends ListQueryDto, TimeRangeQueryDto {
  // 群组状态
  status?: "active" | "dissolved";
  userId?: string;
  
  // 群组属性
  name?: string;
  capacity?: number;
  joinPolicy?: "invite" | "request" | "open";
  
  // 群组设置
  muteAll?: boolean;
  allowMemberInvite?: boolean;
  allowSearchJoin?: boolean;
}
