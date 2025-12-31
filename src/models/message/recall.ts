/**
 * @packageDocumentation
 * @module models/message/recall
 * @since 1.0.0
 * @author Z-kali
 * @description 消息撤回记录表
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface MessageRecallAttributes {
  id: number;
  messageId: number;
  recalledBy: string;
  recalledAt: Date;
  reason: string | null;
  isAdmin: boolean;
}

export type MessageRecallCreationAttributes = Optional<MessageRecallAttributes, "id" | "recalledAt" | "reason" | "isAdmin">;

export class MessageRecall extends Model<MessageRecallAttributes, MessageRecallCreationAttributes> implements MessageRecallAttributes {
  declare id: number;
  declare messageId: number;
  declare recalledBy: string;
  declare recalledAt: Date;
  declare reason: string | null;
  declare isAdmin: boolean;
}

export function initMessageRecall(sequelize: Sequelize): typeof MessageRecall {
  MessageRecall.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      messageId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true, // 一条消息只能被撤回一次
      },
      recalledBy: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      recalledAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "是否管理员撤回",
      },
    },
    {
      sequelize,
      tableName: "message_recalls",
      timestamps: false,
      indexes: [
        { fields: ["messageId"] },
      ],
    }
  );
  return MessageRecall;
}
