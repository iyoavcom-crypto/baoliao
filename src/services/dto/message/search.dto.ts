/**
 * @packageDocumentation
 * @module dto/message/search
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息搜索相关数据传输对象
 */

/**
 * @interface MessageSearchDto
 * @description 消息搜索请求
 * @property {string} keyword - 搜索关键词
 * @property {number} conversationId - 会话ID（不传表示全局搜索）
 * @property {string[]} messageTypes - 消息类型过滤
 * @property {Date} startDate - 开始日期
 * @property {Date} endDate - 结束日期
 * @property {number} page - 页码
 * @property {number} pageSize - 每页数量
 */
export interface MessageSearchDto {
  keyword: string;
  conversationId?: number;
  messageTypes?: string[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

/**
 * @interface MessageSearchResultDto
 * @description 消息搜索结果项
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {string} content - 消息内容
 * @property {string} senderId - 发送者ID
 * @property {string} messageType - 消息类型
 * @property {string} highlightContent - 高亮内容
 * @property {Date} sentAt - 发送时间
 */
export interface MessageSearchResultDto {
  messageId: number;
  conversationId: number;
  content: string;
  senderId: string;
  messageType: string;
  highlightContent: string;
  sentAt: Date;
}

/**
 * @interface MessageSearchResponseDto
 * @description 消息搜索响应
 * @property {MessageSearchResultDto[]} results - 搜索结果列表
 * @property {number} total - 总数
 * @property {number} page - 当前页
 * @property {number} pageSize - 每页数量
 */
export interface MessageSearchResponseDto {
  results: MessageSearchResultDto[];
  total: number;
  page: number;
  pageSize: number;
}
