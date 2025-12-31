/**
 * @packageDocumentation
 * @module models/safety/penalty
 * @since 1.0.0
 * @author Z-kali
 * @description 处罚记录 (禁言/封号)
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface PenaltyAttributes {
  id: number;
  userId: string;
  type: "ban_account" | "ban_chat" | "ban_add_friend" | "ban_create_group";
  reason: string;
  expiresAt: Date | null; // null = permanent
  operatorId: string;
  active: boolean; // 是否生效中
  createdAt: Date;
}

export type PenaltyCreationAttributes = Optional<PenaltyAttributes, "id" | "expiresAt" | "createdAt">;

export class Penalty extends Model<PenaltyAttributes, PenaltyCreationAttributes> implements PenaltyAttributes {
  declare id: number;
  declare userId: string;
  declare type: "ban_account" | "ban_chat" | "ban_add_friend" | "ban_create_group";
  declare reason: string;
  declare expiresAt: Date | null;
  declare operatorId: string;
  declare active: boolean;
  declare createdAt: Date;
}

export function initPenalty(sequelize: Sequelize): typeof Penalty {
  Penalty.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("ban_account", "ban_chat", "ban_add_friend", "ban_create_group"),
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      operatorId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "penalties",
      updatedAt: false,
      indexes: [
        { fields: ["userId"] },
        { fields: ["active"] },
        { fields: ["userId", "active"] }, // 查询用户有效处罚
        { fields: ["expiresAt"] }, // 过期清理任务
        { fields: ["type", "active"] }, // 按类型统计有效处罚
      ],
    }
  );
  return Penalty;
}
