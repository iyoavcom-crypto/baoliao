/**
 * @packageDocumentation
 * @module dto/message/attachment
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息附件相关数据传输对象（与 message_attachments 表对应）
 */

/**
 * @interface MessageAttachmentListDto
 * @description 消息附件列表项
 * @property {number} id - 附件ID
 * @property {number} messageId - 消息ID
 * @property {string} type - MIME类型
 * @property {string} url - 文件URL
 * @property {string | null} name - 文件名
 * @property {number | null} size - 文件大小（字节）
 * @property {Date} createdAt - 创建时间
 */
export interface MessageAttachmentListDto {
  id: number;
  messageId: number;
  type: string;
  url: string;
  name: string | null;
  size: number | null;
  createdAt: Date;
}

/**
 * @interface MessageAttachmentDetailDto
 * @description 消息附件详情
 * @property {number} id - 附件ID
 * @property {number} messageId - 消息ID
 * @property {string} type - MIME类型
 * @property {string} url - 文件URL
 * @property {string | null} name - 文件名
 * @property {number | null} size - 文件大小（字节）
 * @property {number | null} width - 图片宽度
 * @property {number | null} height - 图片高度
 * @property {number | null} duration - 音视频时长（秒）
 * @property {Date} createdAt - 创建时间
 */
export interface MessageAttachmentDetailDto {
  id: number;
  messageId: number;
  type: string;
  url: string;
  name: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  createdAt: Date;
}

/**
 * @interface CreateMessageAttachmentDto
 * @description 创建消息附件
 * @property {number} messageId - 消息ID
 * @property {string} type - MIME类型
 * @property {string} url - 文件URL
 * @property {string} [name] - 文件名
 * @property {number} [size] - 文件大小（字节）
 * @property {number} [width] - 图片宽度
 * @property {number} [height] - 图片高度
 * @property {number} [duration] - 音视频时长（秒）
 */
export interface CreateMessageAttachmentDto {
  messageId: number;
  type: string;
  url: string;
  name?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * @interface MessageAttachmentQueryDto
 * @description 查询消息附件
 * @property {number} [messageId] - 消息ID
 * @property {string} [type] - MIME类型筛选（如 'image/%' 表示所有图片）
 * @property {number} [page] - 页码
 * @property {number} [limit] - 每页数量
 */
export interface MessageAttachmentQueryDto {
  messageId?: number;
  type?: string;
  page?: number;
  limit?: number;
}
