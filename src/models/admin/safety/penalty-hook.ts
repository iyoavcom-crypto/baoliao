/**
 * @packageDocumentation
 * @module models/safety/penalty-hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description Penalty 模型钩子函数
 */

import type { Penalty } from "./penalty.js";

/**
 * @function setupPenaltyHooks
 * @description 设置 Penalty 模型的钩子函数
 * @param {typeof Penalty} PenaltyModel - Penalty 模型类
 */
export function setupPenaltyHooks(PenaltyModel: typeof Penalty): void {
  // 创建前：验证数据合法性
  PenaltyModel.beforeCreate(async (penalty) => {
    // 验证过期时间
    if (penalty.expiresAt && penalty.expiresAt <= new Date()) {
      throw new Error('处罚过期时间必须大于当前时间');
    }

    // 验证处罚原因不能为空
    if (!penalty.reason || penalty.reason.trim().length === 0) {
      throw new Error('处罚原因不能为空');
    }

    // 验证操作员ID
    if (!penalty.operatorId) {
      throw new Error('必须指定操作员ID');
    }

    // 检查是否存在相同类型的活跃处罚
    const existingPenalty = await PenaltyModel.findOne({
      where: {
        userId: penalty.userId,
        type: penalty.type,
        active: true,
      },
    });

    if (existingPenalty) {
      throw new Error(`用户已存在相同类型的处罚: ${penalty.type}`);
    }
  });

  // 保存前：验证处罚逻辑
  PenaltyModel.beforeSave(async (penalty) => {
    // 自动检查过期处罚
    if (penalty.expiresAt && penalty.expiresAt <= new Date() && penalty.active) {
      penalty.active = false;
    }

    // 停用处罚时不能修改其他字段
    if (penalty.changed('active') && !penalty.active) {
      const changedFields = penalty.changed() as string[];
      if (changedFields.length > 1) {
        throw new Error('停用处罚时不能同时修改其他字段');
      }
    }

    // 永久处罚不应有过期时间
    if (penalty.expiresAt === null && !penalty.isNewRecord) {
      // 永久处罚，确认操作
      console.warn(`用户 ${penalty.userId} 被设置为永久处罚: ${penalty.type}`);
    }
  });

  // 创建后：触发处罚事件
  PenaltyModel.afterCreate(async (penalty) => {
    // 触发处罚通知
    // eventEmitter.emit('penalty:created', penalty);
    
    // 记录审计日志
    console.log(`处罚创建: 用户=${penalty.userId}, 类型=${penalty.type}, 操作员=${penalty.operatorId}`);
  });

  // 更新后：触发状态变更事件
  PenaltyModel.afterUpdate(async (penalty) => {
    if (penalty.changed('active') && !penalty.active) {
      // 处罚被解除
      // eventEmitter.emit('penalty:deactivated', penalty);
      console.log(`处罚解除: 用户=${penalty.userId}, 类型=${penalty.type}`);
    }
  });

  // 删除前：验证删除权限
  PenaltyModel.beforeDestroy(async (penalty) => {
    // 处罚记录通常不应物理删除，应使用 active 字段标记
    console.warn(`尝试物理删除处罚记录: ID=${penalty.id}, 建议使用 active=false`);
  });
}

/**
 * @function checkPenaltyExpiration
 * @description 检查并自动停用过期处罚（辅助函数）
 * @param {typeof Penalty} PenaltyModel - Penalty 模型类
 */
export async function checkPenaltyExpiration(PenaltyModel: typeof Penalty): Promise<number> {
  const result = await PenaltyModel.update(
    { active: false },
    {
      where: {
        active: true,
        expiresAt: {
          $lte: new Date(),
        },
      },
    }
  );
  
  const [affectedCount] = result;
  if (affectedCount > 0) {
    console.log(`自动停用了 ${affectedCount} 条过期处罚`);
  }
  
  return affectedCount;
}
