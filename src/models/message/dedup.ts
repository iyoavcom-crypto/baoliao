/**
 * @packageDocumentation
 * @module models/message/dedup
 * @since 1.0.0
 * @author Z-kali
 * @description 消息幂等去重表
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface MessageDedupAttributes {
  id: number;
  clientMsgId: string;
  senderId: string;
  conversationId: number;
  messageId: number; // 关联生成的 Message.id
  createdAt: Date;
}

export type MessageDedupCreationAttributes = Optional<MessageDedupAttributes, "id" | "createdAt">;

export class MessageDedup extends Model<MessageDedupAttributes, MessageDedupCreationAttributes> implements MessageDedupAttributes {
  declare id: number;
  declare clientMsgId: string;
  declare senderId: string;
  declare conversationId: number;
  declare messageId: number;
  declare createdAt: Date;
}

export function initMessageDedup(sequelize: Sequelize): typeof MessageDedup {
  MessageDedup.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      clientMsgId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        comment: "客户端生成的消息唯一ID",
      },
      senderId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      conversationId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      messageId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "已生成的消息ID",
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "message_dedup",
      updatedAt: false,
      indexes: [
        { fields: ["clientMsgId"], unique: true },
        { fields: ["senderId"] },
      ],
    }
  );
  return MessageDedup;
}
