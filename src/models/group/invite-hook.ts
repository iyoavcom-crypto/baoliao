/**
 * @packageDocumentation
 * @module models/group/invite-hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description GroupInvite 模型钩子函数（邀请链接/二维码）
 */

import type { GroupInvite } from "./invite.js";
import { randomUUID } from "crypto";

/**
 * @function setupGroupInviteHooks
 * @description 设置 GroupInvite 模型的钩子函数
 * @param {typeof GroupInvite} GroupInviteModel - GroupInvite 模型类
 */
export function setupGroupInviteHooks(GroupInviteModel: typeof GroupInvite): void {
  // 创建前：生成邀请码、设置默认值
  GroupInviteModel.beforeCreate(async (invite) => {
    // 生成唯一邀请码
    if (!invite.code) {
      const prefix = invite.type === 'qrcode' ? 'qr' : 'inv';
      invite.code = `${prefix}_${randomUUID().replace(/-/g, '')}`;
    }

    // 设置默认过期时间（7天后）
    if (!invite.expiresAt) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      invite.expiresAt = expiresAt;
    }

    // 验证过期时间必须在未来
    if (invite.expiresAt && invite.expiresAt <= new Date()) {
      throw new Error('邀请链接过期时间必须大于当前时间');
    }

    // 验证 maxUses 合法性
    if (invite.maxUses !== null && invite.maxUses <= 0) {
      throw new Error('最大使用次数必须大于 0');
    }

    // 初始化使用次数
    if (invite.uses === undefined) {
      invite.uses = 0;
    }
  });

  // 保存前：验证使用次数
  GroupInviteModel.beforeSave(async (invite) => {
    // 检查使用次数是否超过限制
    if (invite.maxUses !== null && invite.uses > invite.maxUses) {
      throw new Error('邀请链接使用次数已达上限');
    }

    // 检查是否过期
    if (invite.expiresAt && invite.expiresAt <= new Date()) {
      console.warn(`邀请链接已过期: code=${invite.code}, groupId=${invite.groupId}`);
    }
  });

  // 创建后：触发邀请链接创建事件
  GroupInviteModel.afterCreate(async (invite) => {
    // 触发群邀请链接创建事件
    // eventEmitter.emit('group:invite:link:created', {
    //   groupId: invite.groupId,
    //   creatorId: invite.creatorId,
    //   code: invite.code,
    //   type: invite.type,
    //   expiresAt: invite.expiresAt,
    // });

    console.log(
      `[群组] 创建邀请链接: group=${invite.groupId}, code=${invite.code}, ` +
      `type=${invite.type}, creator=${invite.creatorId}`
    );
  });

  // 更新后：检查使用次数变化
  GroupInviteModel.afterUpdate(async (invite) => {
    if (invite.changed('uses')) {
      // 检查是否达到使用上限
      if (invite.maxUses !== null && invite.uses >= invite.maxUses) {
        console.log(`[群组] 邀请链接达到使用上限: code=${invite.code}, uses=${invite.uses}/${invite.maxUses}`);
        
        // 可以触发自动失效事件
        // eventEmitter.emit('group:invite:link:exhausted', {
        //   code: invite.code,
        //   groupId: invite.groupId,
        // });
      }
    }
  });
}

/**
 * @function cleanupExpiredInvites
 * @description 清理过期的群邀请链接（辅助函数）
 * @param {typeof GroupInvite} GroupInviteModel - GroupInvite 模型类
 * @returns {Promise<number>} 清理的邀请数量
 */
export async function cleanupExpiredInvites(GroupInviteModel: typeof GroupInvite): Promise<number> {
  const deletedCount = await GroupInviteModel.destroy({
    where: {
      expiresAt: {
        $lte: new Date(),
      },
    },
  });

  if (deletedCount > 0) {
    console.log(`[群组] 清理了 ${deletedCount} 条过期邀请链接`);
  }

  return deletedCount;
}

/**
 * @function cleanupExhaustedInvites
 * @description 清理使用次数已耗尽的邀请链接（辅助函数）
 * @param {typeof GroupInvite} GroupInviteModel - GroupInvite 模型类
 * @returns {Promise<number>} 清理的邀请数量
 */
export async function cleanupExhaustedInvites(GroupInviteModel: typeof GroupInvite): Promise<number> {
  // 查找使用次数已达上限的邀请
  const exhausted = await GroupInviteModel.findAll({
    where: {
      maxUses: {
        $ne: null,
      },
    },
  });

  const toDelete = exhausted.filter(inv => inv.maxUses !== null && inv.uses >= inv.maxUses);
  const ids = toDelete.map(inv => inv.id);

  if (ids.length === 0) {
    return 0;
  }

  const deletedCount = await GroupInviteModel.destroy({
    where: {
      id: ids,
    },
  });

  if (deletedCount > 0) {
    console.log(`[群组] 清理了 ${deletedCount} 条使用次数已耗尽的邀请链接`);
  }

  return deletedCount;
}

/**
 * @function isInviteValid
 * @description 检查邀请链接是否有效（辅助函数）
 * @param {typeof GroupInvite} GroupInviteModel - GroupInvite 模型类
 * @param {string} code - 邀请码
 * @returns {Promise<boolean>} 是否有效
 */
export async function isInviteValid(
  GroupInviteModel: typeof GroupInvite,
  code: string
): Promise<boolean> {
  const invite = await GroupInviteModel.findOne({
    where: { code },
  });

  if (!invite) {
    return false;
  }

  // 检查是否过期
  if (invite.expiresAt && invite.expiresAt <= new Date()) {
    return false;
  }

  // 检查使用次数是否耗尽
  if (invite.maxUses !== null && invite.uses >= invite.maxUses) {
    return false;
  }

  return true;
}

/**
 * @function incrementInviteUses
 * @description 增加邀请链接使用次数（辅助函数）
 * @param {typeof GroupInvite} GroupInviteModel - GroupInvite 模型类
 * @param {string} code - 邀请码
 * @returns {Promise<boolean>} 是否成功
 */
export async function incrementInviteUses(
  GroupInviteModel: typeof GroupInvite,
  code: string
): Promise<boolean> {
  const invite = await GroupInviteModel.findOne({
    where: { code },
  });

  if (!invite) {
    return false;
  }

  // 检查是否有效
  const valid = await isInviteValid(GroupInviteModel, code);
  if (!valid) {
    return false;
  }

  // 增加使用次数
  await invite.increment('uses');
  return true;
}
