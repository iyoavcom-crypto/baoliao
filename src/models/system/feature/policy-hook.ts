/**
 * @packageDocumentation
 * @module models/system/feature/policy-hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description FeaturePolicy 模型钩子函数
 */

import type { FeaturePolicy } from "./policy.js";

/**
 * @function setupFeaturePolicyHooks
 * @description 设置 FeaturePolicy 模型的钩子函数
 * @param {typeof FeaturePolicy} FeaturePolicyModel - FeaturePolicy 模型类
 */
export function setupFeaturePolicyHooks(FeaturePolicyModel: typeof FeaturePolicy): void {
  // 创建前：验证数据完整性
  FeaturePolicyModel.beforeCreate(async (policy) => {
    // 验证功能键不能为空
    if (!policy.featureKey || policy.featureKey.trim().length === 0) {
      throw new Error('功能键不能为空');
    }

    // 验证目标类型和目标ID的匹配性
    if (policy.targetType === 'global' && policy.targetId !== 'all') {
      throw new Error('全局策略的 targetId 必须为 "all"');
    }

    if (policy.targetType !== 'global' && policy.targetId === 'all') {
      throw new Error('非全局策略的 targetId 不能为 "all"');
    }

    // 检查是否已存在相同的策略
    const existing = await FeaturePolicyModel.findOne({
      where: {
        featureKey: policy.featureKey,
        targetType: policy.targetType,
        targetId: policy.targetId,
      },
    });

    if (existing) {
      throw new Error('功能策略已存在，请使用更新操作');
    }
  });

  // 保存前：记录审计信息
  FeaturePolicyModel.beforeSave(async (policy) => {
    // 验证功能键格式（建议使用点分隔符，如 im.group.create）
    if (!/^[a-z][a-z0-9._-]*$/i.test(policy.featureKey)) {
      throw new Error('功能键格式不正确，建议使用小写字母、数字、点、下划线和连字符');
    }

    // 状态变更需要审计
    if (policy.changed('enabled')) {
      const oldValue = policy.previous('enabled');
      const newValue = policy.enabled;
      
      console.log(
        `[审计] 功能开关变更: feature=${policy.featureKey}, ` +
        `target=${policy.targetType}:${policy.targetId}, ` +
        `${oldValue} -> ${newValue}`
      );
    }
  });

  // 创建后：触发功能策略创建事件
  FeaturePolicyModel.afterCreate(async (policy) => {
    // 触发功能策略创建事件
    // eventEmitter.emit('feature:policy:created', {
    //   featureKey: policy.featureKey,
    //   targetType: policy.targetType,
    //   targetId: policy.targetId,
    //   enabled: policy.enabled,
    // });

    // 记录审计日志
    console.log(
      `[审计] 功能策略创建: feature=${policy.featureKey}, ` +
      `target=${policy.targetType}:${policy.targetId}, enabled=${policy.enabled}`
    );

    // 可以在这里记录到 FeatureAuditLog
    // await FeatureAuditLog.create({
    //   featureKey: policy.featureKey,
    //   action: 'create',
    //   newValue: JSON.stringify({
    //     targetType: policy.targetType,
    //     targetId: policy.targetId,
    //     enabled: policy.enabled,
    //   }),
    //   operatorId: 'system', // 实际应从上下文获取
    // });
  });

  // 更新后：触发功能策略变更事件
  FeaturePolicyModel.afterUpdate(async (policy) => {
    if (policy.changed('enabled')) {
      // 触发功能开关变更事件
      // eventEmitter.emit('feature:policy:changed', {
      //   featureKey: policy.featureKey,
      //   targetType: policy.targetType,
      //   targetId: policy.targetId,
      //   enabled: policy.enabled,
      // });

      // 记录审计日志
      console.log(
        `[审计] 功能开关变更: feature=${policy.featureKey}, ` +
        `target=${policy.targetType}:${policy.targetId}, ` +
        `enabled=${policy.enabled}`
      );

      // 记录到 FeatureAuditLog
      // await FeatureAuditLog.create({
      //   featureKey: policy.featureKey,
      //   action: 'update',
      //   oldValue: JSON.stringify({ enabled: policy.previous('enabled') }),
      //   newValue: JSON.stringify({ enabled: policy.enabled }),
      //   operatorId: 'system',
      // });
    }
  });

  // 删除前：记录审计
  FeaturePolicyModel.beforeDestroy(async (policy) => {
    console.log(
      `[审计] 功能策略删除: feature=${policy.featureKey}, ` +
      `target=${policy.targetType}:${policy.targetId}`
    );
  });

  // 删除后：触发删除事件
  FeaturePolicyModel.afterDestroy(async (policy) => {
    // 触发功能策略删除事件
    // eventEmitter.emit('feature:policy:deleted', {
    //   featureKey: policy.featureKey,
    //   targetType: policy.targetType,
    //   targetId: policy.targetId,
    // });

    // 记录到 FeatureAuditLog
    // await FeatureAuditLog.create({
    //   featureKey: policy.featureKey,
    //   action: 'delete',
    //   oldValue: JSON.stringify({
    //     targetType: policy.targetType,
    //     targetId: policy.targetId,
    //     enabled: policy.enabled,
    //   }),
    //   operatorId: 'system',
    // });
  });
}

/**
 * @function isFeatureEnabled
 * @description 检查功能是否启用（辅助函数）
 * @param {typeof FeaturePolicy} FeaturePolicyModel - FeaturePolicy 模型类
 * @param {string} featureKey - 功能键
 * @param {string} userId - 用户ID
 * @param {string} roleId - 角色ID
 * @param {number} groupId - 群组ID
 * @returns {Promise<boolean>} 功能是否启用
 */
export async function isFeatureEnabled(
  FeaturePolicyModel: typeof FeaturePolicy,
  featureKey: string,
  userId?: string,
  roleId?: string,
  groupId?: number
): Promise<boolean> {
  // 优先级：user > role > group > global
  const conditions: any[] = [];

  if (userId) {
    conditions.push({
      featureKey,
      targetType: 'user',
      targetId: userId,
    });
  }

  if (roleId) {
    conditions.push({
      featureKey,
      targetType: 'role',
      targetId: roleId,
    });
  }

  if (groupId) {
    conditions.push({
      featureKey,
      targetType: 'group',
      targetId: String(groupId),
    });
  }

  // 全局策略
  conditions.push({
    featureKey,
    targetType: 'global',
    targetId: 'all',
  });

  // 按优先级查询
  for (const condition of conditions) {
    const policy = await FeaturePolicyModel.findOne({
      where: condition,
    });

    if (policy) {
      return policy.enabled;
    }
  }

  // 默认启用
  return true;
}

/**
 * @function batchCheckFeatures
 * @description 批量检查功能是否启用（辅助函数）
 * @param {typeof FeaturePolicy} FeaturePolicyModel - FeaturePolicy 模型类
 * @param {string[]} featureKeys - 功能键列表
 * @param {string} userId - 用户ID
 * @param {string} roleId - 角色ID
 * @returns {Promise<Record<string, boolean>>} 功能启用状态映射
 */
export async function batchCheckFeatures(
  FeaturePolicyModel: typeof FeaturePolicy,
  featureKeys: string[],
  userId?: string,
  roleId?: string
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};

  for (const key of featureKeys) {
    result[key] = await isFeatureEnabled(FeaturePolicyModel, key, userId, roleId);
  }

  return result;
}

