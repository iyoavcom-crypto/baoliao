/**
 * @packageDocumentation
 * @module models/file/hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description File 模型钩子函数
 */

import type { FileModel } from "./index.js";
import crypto from "crypto";

/**
 * @function setupFileHooks
 * @description 设置 File 模型的钩子函数
 * @param {typeof FileModel} FileModelClass - File 模型类
 */
export function setupFileHooks(FileModelClass: typeof FileModel): void {
  // 创建前：验证文件哈希
  FileModelClass.beforeCreate(async (file) => {
    // 验证文件哈希格式（SHA256 应为 64 位十六进制）
    if (!/^[a-f0-9]{64}$/i.test(file.hash)) {
      throw new Error('文件哈希格式错误，必须是 SHA256 (64位十六进制)');
    }

    // 验证文件大小
    if (file.size <= 0) {
      throw new Error('文件大小必须大于 0');
    }

    // 验证 MIME 类型格式
    if (!file.mime || !file.mime.includes('/')) {
      throw new Error('MIME 类型格式错误');
    }

    // 检查文件是否已存在（去重）
    const existing = await FileModelClass.findOne({
      where: { hash: file.hash },
    });

    if (existing) {
      // 文件已存在，可以复用
      // 注意：这里不抛出错误，而是在业务层处理引用计数
      console.log(`文件已存在，哈希: ${file.hash}`);
    }
  });

  // 保存前：验证数据完整性
  FileModelClass.beforeSave(async (file) => {
    // 验证文件名长度
    if (file.name.length > 255) {
      throw new Error('文件名长度不能超过 255 个字符');
    }

    // 验证存储路径
    if (!file.key || file.key.length === 0) {
      throw new Error('文件存储路径不能为空');
    }

    // 文件大小限制检查（例如：500MB）
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）`);
    }
  });

  // 删除前：检查文件引用
  FileModelClass.beforeDestroy(async (file) => {
    // 在实际删除前应检查 FileRef 表，确保没有引用
    // 这里仅作提示
    console.warn(`准备删除文件: ${file.id}, 请确保已清理所有引用`);
    
    // 可选：自动检查引用计数
    // const refCount = await FileRef.count({ where: { fileId: file.id } });
    // if (refCount > 0) {
    //   throw new Error(`文件仍有 ${refCount} 个引用，无法删除`);
    // }
  });
}

/**
 * @function generateFileHash
 * @description 生成文件 SHA256 哈希（辅助函数）
 * @param {Buffer} fileBuffer - 文件缓冲区
 * @returns {string} SHA256 哈希值
 */
export function generateFileHash(fileBuffer: Buffer): string {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}
