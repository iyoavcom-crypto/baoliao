/**
 * @packageDocumentation
 * @module dto/message/query
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description Message模块查询参数DTO
 */

import type { ListQueryDto, CursorQueryDto, TimeRangeQueryDto } from "../common/query.dto.js";
import type { MessageType } from "@/constants/index.js";

/**
 * @interface MessageListQueryDto
 * @description 消息列表查询参数（页码分页）
 * @extends ListQueryDto
 * @extends TimeRangeQueryDto
 */
export interface MessageListQueryDto extends ListQueryDto, TimeRangeQueryDto {
  // 消息属性
  conversationId?: number;
  senderId?: string;
  kind?: MessageType;
  
  // 消息状态
  deleted?: boolean;
  deletedForAll?: boolean;
  recalled?: boolean;
  edited?: boolean;
  
  // 序列号范围
  seqFrom?: number;
  seqTo?: number;
  beforeSeq?: number;
  afterSeq?: number;
  
  // 提及与回复
  mentionedUserId?: string;
  repliedMessageId?: number;
}

/**
 * @interface MessageCursorQueryDto
 * @description 消息游标查询参数（游标分页，常用于历史消息拉取）
 * @extends CursorQueryDto
 */
export interface MessageCursorQueryDto extends CursorQueryDto {
  conversationId: number;  // 必填
  kind?: MessageType;
  deleted?: boolean;
}
