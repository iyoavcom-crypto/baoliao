/**
 * @packageDocumentation
 * @module models/file/ref-hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description FileRef 模型钩子函数
 */

import type { FileRef } from "./ref.js";
import type { FileModel } from "./index.js";

/**
 * @function setupFileRefHooks
 * @description 设置 FileRef 模型的钩子函数
 * @param {typeof FileRef} FileRefModel - FileRef 模型类
 */
export function setupFileRefHooks(FileRefModel: typeof FileRef): void {
  // 创建前：验证引用完整性
  FileRefModel.beforeCreate(async (ref) => {
    // 验证至少有一个引用类型
    if (!ref.messageId && !ref.conversationId && !ref.userId) {
      throw new Error('文件引用必须关联至少一个对象（消息/会话/用户）');
    }

    // 验证文件ID不能为空
    if (!ref.fileId) {
      throw new Error('文件ID不能为空');
    }

    // 检查重复引用
    const existing = await FileRefModel.findOne({
      where: {
        fileId: ref.fileId,
        messageId: ref.messageId || null,
        conversationId: ref.conversationId || null,
        userId: ref.userId || null,
      },
    });

    if (existing) {
      throw new Error('文件引用已存在，避免重复创建');
    }
  });

  // 创建后：增加文件引用计数
  FileRefModel.afterCreate(async (ref) => {
    // 可以在这里更新文件的引用计数（如果 File 模型有 refCount 字段）
    // await FileModel.increment('refCount', { where: { id: ref.fileId } });
    
    // 触发文件引用创建事件
    // eventEmitter.emit('file:ref:created', {
    //   fileId: ref.fileId,
    //   refType: ref.messageId ? 'message' : ref.conversationId ? 'conversation' : 'user',
    // });
  });

  // 删除前：检查是否为最后一个引用
  FileRefModel.beforeDestroy(async (ref) => {
    // 检查文件的引用计数
    const refCount = await FileRefModel.count({
      where: { fileId: ref.fileId },
    });

    if (refCount === 1) {
      // 这是最后一个引用，可以标记文件待删除
      console.warn(`文件 ${ref.fileId} 的最后一个引用即将删除，请考虑清理文件`);
      
      // 可以在这里触发文件清理任务
      // eventEmitter.emit('file:no-refs', { fileId: ref.fileId });
    }
  });

  // 删除后：减少文件引用计数
  FileRefModel.afterDestroy(async (ref) => {
    // 更新文件引用计数
    // await FileModel.decrement('refCount', { where: { id: ref.fileId } });
    
    // 触发文件引用删除事件
    // eventEmitter.emit('file:ref:deleted', {
    //   fileId: ref.fileId,
    // });
  });

  // 批量删除后：批量更新引用计数
  FileRefModel.afterBulkDestroy(async (options) => {
    // 可以在这里批量更新引用计数
    console.log('批量删除文件引用完成');
  });
}

/**
 * @function getFileRefCount
 * @description 获取文件的引用计数（辅助函数）
 * @param {typeof FileRef} FileRefModel - FileRef 模型类
 * @param {string} fileId - 文件ID
 * @returns {Promise<number>} 引用计数
 */
export async function getFileRefCount(
  FileRefModel: typeof FileRef,
  fileId: string
): Promise<number> {
  return await FileRefModel.count({
    where: { fileId },
  });
}

/**
 * @function findUnreferencedFiles
 * @description 查找无引用的文件（辅助函数）
 * @param {typeof FileModel} FileModelClass - File 模型类
 * @param {typeof FileRef} FileRefModel - FileRef 模型类
 * @param {number} daysOld - 文件创建多少天后才检查（默认7天）
 * @returns {Promise<string[]>} 无引用的文件ID列表
 */
export async function findUnreferencedFiles(
  FileModelClass: typeof FileModel,
  FileRefModel: typeof FileRef,
  daysOld: number = 7
): Promise<string[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // 查找旧文件
  const oldFiles = await FileModelClass.findAll({
    where: {
      createdAt: {
        $lte: cutoffDate,
      },
    },
    attributes: ['id'],
  });

  const oldFileIds = oldFiles.map(f => f.id);

  // 查找有引用的文件
  const referencedFiles = await FileRefModel.findAll({
    where: {
      fileId: oldFileIds,
    },
    attributes: ['fileId'],
    group: ['fileId'],
  });

  const referencedFileIds = new Set(referencedFiles.map(r => r.fileId));

  // 返回无引用的文件
  return oldFileIds.filter(id => !referencedFileIds.has(id));
}

/**
 * @function cleanupUnreferencedFiles
 * @description 清理无引用的文件（辅助函数）
 * @param {typeof FileModel} FileModelClass - File 模型类
 * @param {typeof FileRef} FileRefModel - FileRef 模型类
 * @param {number} daysOld - 文件创建多少天后才清理（默认30天）
 * @returns {Promise<number>} 清理的文件数量
 */
export async function cleanupUnreferencedFiles(
  FileModelClass: typeof FileModel,
  FileRefModel: typeof FileRef,
  daysOld: number = 30
): Promise<number> {
  const unreferencedIds = await findUnreferencedFiles(
    FileModelClass,
    FileRefModel,
    daysOld
  );

  if (unreferencedIds.length === 0) {
    return 0;
  }

  // 删除无引用的文件记录
  const deletedCount = await FileModelClass.destroy({
    where: {
      id: unreferencedIds,
    },
  });

  console.log(`清理了 ${deletedCount} 个无引用的旧文件`);
  return deletedCount;
}
