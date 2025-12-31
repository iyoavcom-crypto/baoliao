/**
 * @packageDocumentation
 * @module models/message/offline
 * @since 1.0.0
 * @author Z-kali
 * @description 离线消息箱
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface OfflineInboxAttributes {
  id: number;
  userId: string;
  messageId: number;
  conversationId: number;
  createdAt: Date;
}

export type OfflineInboxCreationAttributes = Optional<OfflineInboxAttributes, "id" | "createdAt">;

export class OfflineInbox extends Model<OfflineInboxAttributes, OfflineInboxCreationAttributes> implements OfflineInboxAttributes {
  declare id: number;
  declare userId: string;
  declare messageId: number;
  declare conversationId: number;
  declare createdAt: Date;
}

export function initOfflineInbox(sequelize: Sequelize): typeof OfflineInbox {
  OfflineInbox.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "接收用户ID",
      },
      messageId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "消息ID",
      },
      conversationId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "offline_inboxes",
      updatedAt: false,
      indexes: [
        { fields: ["userId"] }, // 查询离线消息
        { fields: ["userId", "messageId"], unique: true },
        { fields: ["userId", "conversationId"] }, // 按会话查询离线消息
      ],
    }
  );
  return OfflineInbox;
}
