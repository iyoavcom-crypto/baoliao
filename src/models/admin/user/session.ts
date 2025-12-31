/**
 * @packageDocumentation
 * @module models/admin/user/session
 * @since 1.0.0 (2025-12-22)
 * @author Z-kali
 * @description 用户会话模型（最小实现，用于满足关联与运行时导入）
 */

import { DataTypes, Model, type Sequelize, type Optional } from "sequelize";

/**
 * @interface UserSessionAttributes
 * @description 用户会话表字段定义
 * @property {string} id - 会话 ID
 * @property {string} userId - 用户 ID
 * @property {string} deviceId - 设备 ID
 * @property {string | null} token - 令牌快照（可选）
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface UserSessionAttributes {
  id: string;
  userId: string;
  deviceId: string;
  token: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @type UserSessionCreationAttributes
 * @description 创建会话时可省略部分字段
 */
export type UserSessionCreationAttributes = Optional<UserSessionAttributes, "id" | "token" | "createdAt" | "updatedAt">;

/**
 * @class UserSession
 * @description 用户会话模型
 */
export class UserSession extends Model<UserSessionAttributes, UserSessionCreationAttributes> implements UserSessionAttributes {
  declare id: string;
  declare userId: string;
  declare deviceId: string;
  declare token: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

/**
 * @function initUserSession
 * @description 初始化 UserSession 模型定义
 * @param {Sequelize} sequelize - Sequelize 实例
 * @returns {typeof UserSession} 模型类
 */
export function initUserSession(sequelize: Sequelize): typeof UserSession {
  UserSession.init(
    {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
        comment: "主键",
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "用户ID",
      },
      deviceId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: "设备ID",
      },
      token: {
        type: DataTypes.STRING(512),
        allowNull: true,
        comment: "令牌快照（可选）",
      },
      createdAt: { type: DataTypes.DATE, allowNull: false, comment: "创建时间" },
      updatedAt: { type: DataTypes.DATE, allowNull: false, comment: "更新时间" },
    },
    {
      sequelize,
      modelName: "UserSession",
      tableName: "user_session",
      timestamps: true,
      paranoid: false,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [{ fields: ["userId"] }, { fields: ["deviceId"] }],
      comment: "用户会话表",
    }
  );
  return UserSession;
}

