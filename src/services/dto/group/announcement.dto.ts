/**
 * @packageDocumentation
 * @module dto/group/announcement
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 群公告相关数据传输对象
 */

/**
 * @interface GroupAnnouncementListDto
 * @description 群公告列表项
 * @property {number} id - 公告ID
 * @property {number} groupId - 群组ID
 * @property {string} title - 公告标题
 * @property {string} content - 公告内容
 * @property {string} publisherId - 发布人ID
 * @property {boolean} isPinned - 是否置顶
 * @property {Date} createdAt - 创建时间
 */
export interface GroupAnnouncementListDto {
  id: number;
  groupId: number;
  title: string;
  content: string;
  publisherId: string;
  isPinned: boolean;
  createdAt: Date;
}

/**
 * @interface GroupAnnouncementDetailDto
 * @description 群公告详情
 * @property {number} id - 公告ID
 * @property {number} groupId - 群组ID
 * @property {string} title - 公告标题
 * @property {string} content - 公告内容
 * @property {string} publisherId - 发布人ID
 * @property {boolean} isPinned - 是否置顶
 * @property {boolean} requireConfirm - 是否需要确认
 * @property {number} readCount - 已读人数
 * @property {number} confirmCount - 已确认人数
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface GroupAnnouncementDetailDto {
  id: number;
  groupId: number;
  title: string;
  content: string;
  publisherId: string;
  isPinned: boolean;
  requireConfirm: boolean;
  readCount: number;
  confirmCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface GroupAnnouncementCreatableDto
 * @description 群公告可创建字段
 * @property {number} groupId - 群组ID
 * @property {string} title - 公告标题
 * @property {string} content - 公告内容
 * @property {boolean} isPinned - 是否置顶
 * @property {boolean} requireConfirm - 是否需要确认
 */
export interface GroupAnnouncementCreatableDto {
  groupId: number;
  title: string;
  content: string;
  isPinned?: boolean;
  requireConfirm?: boolean;
}

/**
 * @interface GroupAnnouncementUpdatableDto
 * @description 群公告可更新字段
 * @property {string} title - 公告标题
 * @property {string} content - 公告内容
 * @property {boolean} isPinned - 是否置顶
 */
export interface GroupAnnouncementUpdatableDto {
  title?: string;
  content?: string;
  isPinned?: boolean;
}

/**
 * @interface GroupAnnouncementConfirmDto
 * @description 确认群公告
 * @property {number} announcementId - 公告ID
 * @property {string} userId - 用户ID
 */
export interface GroupAnnouncementConfirmDto {
  announcementId: number;
  userId: string;
}
