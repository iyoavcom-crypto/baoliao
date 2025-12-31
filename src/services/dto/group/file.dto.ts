/**
 * @packageDocumentation
 * @module dto/group/file
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 群文件管理相关数据传输对象
 */

/**
 * @interface GroupFileListDto
 * @description 群文件列表项
 * @property {number} id - 文件记录ID
 * @property {number} groupId - 群组ID
 * @property {string} fileId - 文件ID
 * @property {string} fileName - 文件名
 * @property {number} fileSize - 文件大小（字节）
 * @property {string} fileType - 文件类型
 * @property {string} uploaderId - 上传者ID
 * @property {Date} uploadedAt - 上传时间
 */
export interface GroupFileListDto {
  id: number;
  groupId: number;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploaderId: string;
  uploadedAt: Date;
}

/**
 * @interface GroupFileDetailDto
 * @description 群文件详情
 * @property {number} id - 文件记录ID
 * @property {number} groupId - 群组ID
 * @property {string} fileId - 文件ID
 * @property {string} fileName - 文件名
 * @property {number} fileSize - 文件大小（字节）
 * @property {string} fileType - 文件类型
 * @property {string} uploaderId - 上传者ID
 * @property {string | null} description - 文件描述
 * @property {number} downloadCount - 下载次数
 * @property {Date} uploadedAt - 上传时间
 */
export interface GroupFileDetailDto {
  id: number;
  groupId: number;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploaderId: string;
  description: string | null;
  downloadCount: number;
  uploadedAt: Date;
}

/**
 * @interface GroupFileUploadDto
 * @description 群文件上传
 * @property {number} groupId - 群组ID
 * @property {string} fileId - 文件ID
 * @property {string} fileName - 文件名
 * @property {number} fileSize - 文件大小
 * @property {string} fileType - 文件类型
 * @property {string} description - 文件描述
 */
export interface GroupFileUploadDto {
  groupId: number;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  description?: string;
}

/**
 * @interface GroupFileDeleteDto
 * @description 删除群文件
 * @property {number} groupId - 群组ID
 * @property {number} fileId - 文件记录ID
 */
export interface GroupFileDeleteDto {
  groupId: number;
  fileId: number;
}
