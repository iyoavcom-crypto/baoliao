/**
 * @packageDocumentation
 * @module models/admin/safety/ip-block-hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description IpBlock 模型钩子函数
 */

import type { IpBlock } from "./ip-block.js";
import { Op } from "sequelize";

/**
 * @function setupIpBlockHooks
 * @description 设置 IpBlock 模型的钩子函数
 * @param {typeof IpBlock} IpBlockModel - IpBlock 模型类
 */
export function setupIpBlockHooks(IpBlockModel: typeof IpBlock): void {
  // 创建前：验证数据合法性
  IpBlockModel.beforeCreate(async (block) => {
    // 验证封禁类型和值
    if (block.type === 'ip') {
      // 验证IP地址格式（简单验证）
      if (!isValidIP(block.value)) {
        throw new Error('IP地址格式不正确');
      }
    } else if (block.type === 'device') {
      // 验证设备ID格式
      if (!block.value || block.value.length < 10) {
        throw new Error('设备ID格式不正确');
      }
    }

    // 验证封禁原因不能为空
    if (!block.reason || block.reason.trim().length === 0) {
      throw new Error('封禁原因不能为空');
    }

    // 验证过期时间
    if (block.expiresAt && block.expiresAt <= new Date()) {
      throw new Error('封禁过期时间必须大于当前时间');
    }

    // 检查是否已存在相同的封禁
    const existing = await IpBlockModel.findOne({
      where: {
        type: block.type,
        value: block.value,
      },
    });

    if (existing) {
      throw new Error(`${block.type === 'ip' ? 'IP地址' : '设备'}已被封禁`);
    }
  });

  // 保存前：自动检查过期
  IpBlockModel.beforeSave(async (block) => {
    // 自动清理过期的封禁
    if (block.expiresAt && block.expiresAt <= new Date()) {
      // 过期的封禁应该被删除或标记
      console.warn(`封禁已过期: ${block.type}=${block.value}, 将被自动清理`);
    }

    // 永久封禁警告
    if (block.expiresAt === null && !block.isNewRecord) {
      console.warn(`设置永久封禁: ${block.type}=${block.value}, 操作员=${block.operatorId}`);
    }
  });

  // 创建后：触发封禁事件
  IpBlockModel.afterCreate(async (block) => {
    // 触发IP/设备封禁事件
    // eventEmitter.emit('security:block:created', {
    //   type: block.type,
    //   value: block.value,
    //   reason: block.reason,
    //   expiresAt: block.expiresAt,
    //   operatorId: block.operatorId,
    // });

    // 记录审计日志
    console.log(
      `[安全] 新增封禁: type=${block.type}, value=${block.value}, ` +
      `reason=${block.reason}, operator=${block.operatorId}`
    );
  });

  // 删除后：触发解封事件
  IpBlockModel.afterDestroy(async (block) => {
    // 触发解封事件
    // eventEmitter.emit('security:block:removed', {
    //   type: block.type,
    //   value: block.value,
    // });

    console.log(`[安全] 解除封禁: ${block.type}=${block.value}`);
  });
}

/**
 * @function isValidIP
 * @description 验证IP地址格式（辅助函数）
 * @param {string} ip - IP地址
 * @returns {boolean} 是否有效
 */
function isValidIP(ip: string): boolean {
  // IPv4 正则
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 简单验证
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(ip)) {
    // 验证每个数字在 0-255 之间
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  return ipv6Regex.test(ip);
}

/**
 * @function cleanupExpiredBlocks
 * @description 清理过期的IP/设备封禁（辅助函数）
 * @param {typeof IpBlock} IpBlockModel - IpBlock 模型类
 * @returns {Promise<number>} 清理的封禁数量
 */
export async function cleanupExpiredBlocks(IpBlockModel: typeof IpBlock): Promise<number> {
  const deletedCount = await IpBlockModel.destroy({
    where: {
      expiresAt: {
        [Op.lte]: new Date(),
      },
    },
  });

  if (deletedCount > 0) {
    console.log(`[安全] 自动清理了 ${deletedCount} 条过期封禁`);
  }

  return deletedCount;
}

/**
 * @function isBlocked
 * @description 检查IP或设备是否被封禁（辅助函数）
 * @param {typeof IpBlock} IpBlockModel - IpBlock 模型类
 * @param {string} ip - IP地址
 * @param {string} deviceId - 设备ID
 * @returns {Promise<boolean>} 是否被封禁
 */
export async function isBlocked(
  IpBlockModel: typeof IpBlock,
  ip?: string,
  deviceId?: string
): Promise<boolean> {
  const conditions: any[] = [];

  if (ip) {
    conditions.push({
      type: 'ip',
      value: ip,
    });
  }

  if (deviceId) {
    conditions.push({
      type: 'device',
      value: deviceId,
    });
  }

  if (conditions.length === 0) {
    return false;
  }

  const block = await IpBlockModel.findOne({
    where: {
      [Op.and]: [
        { [Op.or]: conditions },
        {
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } },
          ],
        },
      ],
    },
  });

  return block !== null;
}
