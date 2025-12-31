// api/src/models/user.ts
/**
 * @packageDocumentation
 * @module models/user
 * @since 1.0.14 (2025-10-31)
 * @author Z-kali
 * @description User 模型：password 哈希；pin 二级密码（需 secret）；哈希透明升级；默认隐藏敏感字段；关联 Role；角色默认 user
 * @path api/src/models/user.ts
 * @see api/src/types/models/user/index.ts
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import { genUserId, genUserName } from "@/utils";
import { verifyPassword as verifyPasswordScrypt } from "@/tools/crypto/password";
import { encryptPin as encryptPinGcm } from "@/tools/crypto/pin";
import { setupUserHooks } from "./hook.js";
import type { UserState, UserType } from "@/constants";

/**
 * @interface UserAttributes
 * @description 用户属性（deletedAt 由 paranoid 模式自动管理，不在此定义）
 */
export interface UserAttributes {
  id: string;
  pid: string | null;
  type: UserType;
  phone: string;
  password: string;
  passwordUpdatedAt: Date | null;
  pin: string | null;
  name: string | null;
  avatar: string | null;
  vip: boolean;
  longSession: boolean;
  twoFactorEnabled: boolean;
  state: UserState;
  roleId: string;
  telegramId: string | null;
  teamId: string | null;
  ip: string | null;
  ua: string | null;
  lastLoginAt: Date | null;
  lastOnlineAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @function getPinSecret
 * @description 获取 PIN 加密密钥（长度需 ≥16），若未配置则返回 null
 * @returns {string|null} 合法密钥或 null
 */
function getPinSecret(): string | null {
  const v = process.env.PIN_SECRET;
  if (typeof v !== "string") return null;
  return v.length >= 16 ? v : null;
}

/**
 * @type UserCreationAttributes
 * @description 创建时可省略部分字段
 */
export type UserCreationAttributes = Optional<
  UserAttributes,
  | "id"
  | "pid"
  | "name"
  | "avatar"
  | "pin"
  | "vip"
  | "state"
  | "longSession"
  | "twoFactorEnabled"
  | "roleId"
  | "teamId"
  | "telegramId"
  | "lastLoginAt"
  | "lastOnlineAt"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class User
 * @description 用户模型
 */
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare type: UserType;
  declare id: string;
  declare pid: string | null;

  declare phone: string;
  declare password: string;
  declare passwordUpdatedAt: Date | null;
  declare pin: string | null;
  declare vip: boolean; // 是否 VIP 用户
  declare longSession: boolean; // 是否允许长期登录
  declare twoFactorEnabled: boolean;

  declare roleId: string;
  declare telegramId: string | null;
  declare teamId: string | null;
  declare state: UserState;

  declare name: string | null;
  declare avatar: string | null;
  declare ip: string | null;
  declare ua: string | null;
 
  declare lastLoginAt: Date | null;
  declare lastOnlineAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  async verifyPassword(plain: string): Promise<boolean> {
    return verifyPasswordAsync(plain, this.password);
  }

  async verifyPin(plain: string): Promise<boolean> {
    const secret = getPinSecret();
    if (!this.pin || !secret) return false;
    const decrypted = await encryptPinAsync(this.pin, secret);
    return decrypted === plain;
  }

  static async authenticate(phone: string, plain: string): Promise<User> {
    const user = await User.scope("withSecret").findOne({
      where: { phone },
      attributes: ["id", "phone", "roleId", "name", "avatar", "state", "password", "pin"],
    });
    if (!user) throw new Error("用户不存在或密码错误");

    const ok = await verifyPasswordAsync(plain, user.password);
    const needsRehash = false; // 如需升级哈希，后续再扩展
    const newHash = null;
    if (!ok) throw new Error("用户不存在或密码错误");

    if (needsRehash && newHash) {
      user.password = newHash;
      await user.save({ hooks: false });
    }

    const safe = await User.findByPk(user.id);
    if (!safe) throw new Error("用户不存在");
    return safe;
  }

  /**
   * @function toJSON
   * @description 强类型安全序列化，剔除敏感字段
   * @returns {Omit<UserAttributes,"password"|"pin">} 安全对象
   */
  override toJSON(): Omit<UserAttributes, "password" | "pin"> {
    // Sequelize get({ plain: true }) 返回 unknown；此处仅做一次性、非 any 的类型断言
    const plain = super.get({ plain: true }) as unknown as UserAttributes;
    // 移除敏感字段
    const { password: _pw, pin: _pin, ...safe } = plain;
    return safe;
  }
}

/**
 * @function initUser
 * @description 初始化 User 模型定义并建立 Role 关联
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof User} 模型类
 */
export function initUser(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true,
        defaultValue: genUserId,
        comment: "主键（11位随机数字）",
      },
      pid: {
        type: DataTypes.STRING(11),
        allowNull: true,
        comment: "父级ID",
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: genUserName,
        comment: "用户名",
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: "手机号",
      },
      type: {
        type: DataTypes.ENUM("employee", "user"),
        allowNull: false,
        defaultValue: "user",
        comment: "用户类型（employee/user）",
      },
      password: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: "密码哈希（scrypt）",
      },
      passwordUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "密码最后修改时间",
      },
      pin: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "二级密码（AES-256-GCM 加密；默认不序列化返回）",
      },
      avatar: { type: DataTypes.STRING(255), allowNull: true, comment: "头像URL" },
      vip: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否 VIP 用户（false：否；true：是）",
      },
      longSession: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否允许长期登录（false：否；true：是）",
      },
      twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否开启 2FA",
      },
      state: {
        type: DataTypes.ENUM("active", "deleted", "banned", "locked"),
        allowNull: false,
        defaultValue: "active",
        comment: "用户状态",
      },
      roleId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        defaultValue: "user",
        comment: "角色ID（默认 user）",
        references: { model: "role", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      telegramId: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: "Telegram ID",
      },
      teamId: {
        type: DataTypes.STRING(36),
        allowNull: true,
        comment: "团队 ID",
      },
      ip: { type: DataTypes.STRING(255), allowNull: true, comment: "IP 地址" },
      ua: { type: DataTypes.STRING(255), allowNull: true, comment: "User-Agent" },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true, comment: "最后登录时间" },
      lastOnlineAt: { type: DataTypes.DATE, allowNull: true, comment: "最后在线时间" },
      createdAt: { type: DataTypes.DATE, allowNull: false, comment: "创建时间" },
      updatedAt: { type: DataTypes.DATE, allowNull: false, comment: "更新时间" },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "user",
      timestamps: true,
      paranoid: true,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      defaultScope: { attributes: { exclude: ["password", "pin"] } },
      scopes: { withSecret: { attributes: { include: ["password", "pin"] } } },
      indexes: [
        {
          name: "user_createdAt_id_desc_idx",
          using: "BTREE",
          fields: [
            { name: "createdAt", order: "DESC" },
            { name: "id", order: "DESC" },
          ],
        },
        { name: "user_phone_unique_idx", unique: true, fields: ["phone"] },
        { fields: ["roleId"] },
        { fields: ["state"] },
        { fields: ["lastOnlineAt"] },
      ],
      comment: "用户表",
    }
  );

  setupUserHooks(User);

  return User;
}

async function verifyPasswordAsync(plain: string, password: string): Promise<boolean> {
  return verifyPasswordScrypt(plain, password);
}

async function encryptPinAsync(p: string, secret: string): Promise<string> {
  return encryptPinGcm(p, secret);
}
