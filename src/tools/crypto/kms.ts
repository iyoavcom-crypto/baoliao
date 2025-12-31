// src/crypto/kms.ts
/**
 * @packageDocumentation
 * @module crypto-kms
 * @since 1.3.2 (2025-10-23)
 * @author Z-kali
 * @description KeyProvider 接口与默认 EnvKeyProvider；生产环境支持密钥轮换与按KID检索
 */

import { randomUUID } from "node:crypto";
// 直接从 process.env 读取所需字段（全局声明在 @z-kali/types/global.d.ts 中提供）
import process from "node:process";
import type { SymmetricKey } from "./aesgcm";

/**
 * @interface KeyProvider
 * @description 密钥提供器接口
 * @property {Function} getActiveKey - 获取当前激活密钥
 * @property {Function} getKeyById - 按 KID 获取历史密钥
 */
export interface KeyProvider {
  /**
   * @function getActiveKey
   * @description 获取当前激活密钥
   * @returns {Promise<SymmetricKey>} 当前激活密钥实体
   */
  getActiveKey(): Promise<SymmetricKey>;

  /**
   * @function getKeyById
   * @description 按 KID 获取历史密钥
   * @param {string} kid - 密钥ID
   * @returns {Promise<SymmetricKey|null>} 历史密钥实体或 null
   */
  getKeyById(kid: string): Promise<SymmetricKey | null>;
}

/**
 * @class EnvKeyProvider
 * @description 基于环境变量的密钥提供器；用于生产环境加载主密钥
 * @property {SymmetricKey} active - 当前激活密钥
 * @property {Map<string, SymmetricKey>} archive - 历史密钥缓存
 * @property {number} rotationDays - 密钥轮换间隔天数
 */
export class EnvKeyProvider implements KeyProvider {
  private active: SymmetricKey;
  private readonly archive = new Map<string, SymmetricKey>();
  private readonly rotationDays: number;

  /**
   * @constructor
   * @description 初始化密钥提供器，加载主密钥并设置轮换参数
   * @throws {Error} 当 DATA_MASTER_KEY 缺失或长度不合法时抛出
   */
  constructor() {
    const { DATA_MASTER_KEY, DATA_MASTER_KEY_KID, KEY_ROTATION_DAYS } = process.env as Record<string, string | undefined>;
    const raw = DATA_MASTER_KEY;
    if (!raw) throw new Error("缺少 DATA_MASTER_KEY");
    const key = Buffer.from(raw, "base64url");
    if (key.length !== 32) throw new Error("DATA_MASTER_KEY 必须为32字节 base64url");
    const kid = DATA_MASTER_KEY_KID || randomUUID();
    this.active = { kid, key };
    this.archive.set(kid, this.active);
    this.rotationDays = Math.max(1, Number(KEY_ROTATION_DAYS ?? 90));
  }

  /**
   * @function getActiveKey
   * @description 返回当前激活密钥
   * @returns {Promise<SymmetricKey>} 当前密钥实体
   */
  async getActiveKey(): Promise<SymmetricKey> {
    return this.active;
  }

  /**
   * @function getKeyById
   * @description 按 KID 检索密钥
   * @param {string} kid - 密钥ID
   * @returns {Promise<SymmetricKey|null>} 匹配密钥或 null
   */
  async getKeyById(kid: string): Promise<SymmetricKey | null> {
    return this.archive.get(kid) ?? null;
  }

  /**
   * @function rotateIfNeeded
   * @description 密钥轮换占位；生产应结合持久层与时间策略实现
   * @returns {Promise<void>} 无返回
   */
  async rotateIfNeeded(): Promise<void> {
    void this.rotationDays;
  }
}
