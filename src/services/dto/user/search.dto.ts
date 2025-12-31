/**
 * @packageDocumentation
 * @module dto/user/search
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 用户搜索相关数据传输对象
 */

/**
 * @interface UserSearchRequestDto
 * @description 用户搜索请求体
 * @property {string} keyword - 搜索关键词
 * @property {'phone' | 'nickname' | 'id'} type - 搜索类型
 * @property {number} page - 页码
 * @property {number} limit - 每页数量
 */
export interface UserSearchRequestDto {
  keyword: string;
  type: 'phone' | 'nickname' | 'id';
  page?: number;
  limit?: number;
}

/**
 * @interface UserSearchResponseDto
 * @description 用户搜索响应体
 * @property {Array<{id: string, nickname: string, avatar: string, isFriend: boolean}>} items - 搜索结果列表
 * @property {number} total - 总数
 */
export interface UserSearchResponseDto {
  items: Array<{
    id: string;
    nickname: string | null;
    avatar: string | null;
    isFriend: boolean;
  }>;
  total: number;
}

/**
 * @interface UserSearchItemDto
 * @description 用户搜索结果项
 * @property {string} id - 用户ID
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像
 * @property {boolean} isFriend - 是否为好友
 */
export interface UserSearchItemDto {
  id: string;
  nickname: string | null;
  avatar: string | null;
  isFriend: boolean;
}