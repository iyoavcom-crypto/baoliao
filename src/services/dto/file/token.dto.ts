/**
 * @packageDocumentation
 * @module dto/file/token
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 文件访问令牌相关数据传输对象
 */

/**
 * @interface FileTokenListDto
 * @description 文件令牌列表项
 * @property {number} id - 令牌ID
 * @property {string} fileId - 文件ID
 * @property {string} userId - 用户ID
 * @property {string} token - 令牌
 * @property {Date} expiresAt - 过期时间
 * @property {Date} createdAt - 创建时间
 */
export interface FileTokenListDto {
  id: number;
  fileId: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * @interface FileTokenDetailDto
 * @description 文件令牌详情
 * @property {number} id - 令牌ID
 * @property {string} fileId - 文件ID
 * @property {string} userId - 用户ID
 * @property {string} token - 令牌
 * @property {Date} expiresAt - 过期时间
 * @property {Date} createdAt - 创建时间
 */
export interface FileTokenDetailDto {
  id: number;
  fileId: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * @interface FileTokenCreatableDto
 * @description 文件令牌可创建字段
 * @property {string} fileId - 文件ID
 * @property {Date} expiresAt - 过期时间
 */
export interface FileTokenCreatableDto {
  fileId: string;
  expiresAt?: Date;
}

/**
 * @interface FileTokenValidateDto
 * @description 验证文件令牌
 * @property {string} token - 令牌
 */
export interface FileTokenValidateDto {
  token: string;
}
