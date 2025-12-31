/**
 * @packageDocumentation
 * @module dto/file
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 文件相关数据传输对象
 */

/**
 * @interface FileListDto
 * @description 文件列表项
 * @property {string} id - 文件ID
 * @property {string} name - 文件名
 * @property {string} mime - MIME类型
 * @property {number} size - 文件大小
 * @property {string} uploaderId - 上传者ID
 * @property {Date} createdAt - 创建时间
 */
export interface FileListDto {
  id: string;
  name: string;
  mime: string;
  size: number;
  uploaderId: string;
  createdAt: Date;
}

/**
 * @interface FileDetailDto
 * @description 文件详情
 * @property {string} id - 文件ID
 * @property {string} hash - 文件哈希
 * @property {string} name - 文件名
 * @property {string} mime - MIME类型
 * @property {number} size - 文件大小
 * @property {string} key - 存储路径
 * @property {string} uploaderId - 上传者ID
 * @property {Date} createdAt - 创建时间
 */
export interface FileDetailDto {
  id: string;
  hash: string;
  name: string;
  mime: string;
  size: number;
  key: string;
  uploaderId: string;
  createdAt: Date;
}

/**
 * @interface FileUploadDto
 * @description 文件上传请求
 * @property {string} name - 文件名
 * @property {string} mime - MIME类型
 * @property {number} size - 文件大小
 * @property {string} hash - 文件哈希
 */
export interface FileUploadDto {
  name: string;
  mime: string;
  size: number;
  hash: string;
}

/**
 * @interface FileUploadResponseDto
 * @description 文件上传响应
 * @property {string} id - 文件ID
 * @property {string} url - 访问URL
 */
export interface FileUploadResponseDto {
  id: string;
  url: string;
}
