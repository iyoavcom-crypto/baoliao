/**
 * @packageDocumentation
 * @module models/message/mention
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息@提及表（从 JSON 字段拆分出来，支持索引查询）
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

/**
 * @interface MessageMentionAttributes
 * @description 消息@提及表字段定义
 */
export interface MessageMentionAttributes {
  id: number;
  messageId: number; // Message.id
  conversationId: number; // 冗余字段，便于查询
  userId: string; // 被@的用户ID
  createdAt: Date;
}

export type MessageMentionCreationAttributes = Optional<
  MessageMentionAttributes,
  "id" | "createdAt"
>;

export class MessageMention
  extends Model<MessageMentionAttributes, MessageMentionCreationAttributes>
  implements MessageMentionAttributes
{
  declare id: number;
  declare messageId: number;
  declare conversationId: number;
  declare userId: string;
  declare createdAt: Date;
}

export function initMessageMention(sequelize: Sequelize): typeof MessageMention {
  MessageMention.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: "主键ID",
      },
      messageId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "消息ID",
        references: {
          model: "messages",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      conversationId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "会话ID（冗余字段）",
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "被@的用户ID",
        references: {
          model: "user",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: { 
        type: DataTypes.DATE, 
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "创建时间" 
      },
    },
    {
      sequelize,
      tableName: "message_mentions",
      updatedAt: false,
      comment: "消息@提及表（支持查询@我的消息）",
      indexes: [
        { fields: ["messageId"] }, // 查询消息的所有@
        { fields: ["userId", "createdAt"] }, // 查询用户被@的消息（时间倒序）
        { fields: ["conversationId", "userId"] }, // 会话内@某人的消息
        { fields: ["messageId", "userId"], unique: true }, // 防止重复@
      ],
    }
  );
  return MessageMention;
}
