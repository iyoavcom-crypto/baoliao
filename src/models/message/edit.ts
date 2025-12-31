/**
 * @packageDocumentation
 * @module models/message/edit
 * @since 1.0.0
 * @author Z-kali
 * @description 消息编辑历史表
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface MessageEditAttributes {
  id: number;
  messageId: number;
  content: string; // 旧内容
  editedAt: Date;
  editedBy: string;
}

export type MessageEditCreationAttributes = Optional<MessageEditAttributes, "id" | "editedAt">;

export class MessageEdit extends Model<MessageEditAttributes, MessageEditCreationAttributes> implements MessageEditAttributes {
  declare id: number;
  declare messageId: number;
  declare content: string;
  declare editedAt: Date;
  declare editedBy: string;
}

export function initMessageEdit(sequelize: Sequelize): typeof MessageEdit {
  MessageEdit.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      messageId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "编辑前的内容",
      },
      editedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      editedBy: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "message_edits",
      timestamps: false,
      indexes: [
        { fields: ["messageId"] },
      ],
    }
  );
  return MessageEdit;
}
