/**
 * @packageDocumentation
 * @module dto/message/edit
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息编辑相关数据传输对象
 */

/**
 * @interface MessageEditListDto
 * @description 消息编辑历史列表项
 * @property {number} id - 编辑记录ID
 * @property {number} messageId - 消息ID
 * @property {string} content - 编辑前内容
 * @property {Date} editedAt - 编辑时间
 * @property {string} editedBy - 编辑人ID
 */
export interface MessageEditListDto {
  id: number;
  messageId: number;
  content: string;
  editedAt: Date;
  editedBy: string;
}

/**
 * @interface MessageEditDetailDto
 * @description 消息编辑历史详情
 * @property {number} id - 编辑记录ID
 * @property {number} messageId - 消息ID
 * @property {string} content - 编辑前内容
 * @property {Date} editedAt - 编辑时间
 * @property {string} editedBy - 编辑人ID
 */
export interface MessageEditDetailDto {
  id: number;
  messageId: number;
  content: string;
  editedAt: Date;
  editedBy: string;
}

/**
 * @interface MessageEditRequestDto
 * @description 编辑消息请求
 * @property {number} messageId - 消息ID
 * @property {string} content - 新内容
 */
export interface MessageEditRequestDto {
  messageId: number;
  content: string;
}
