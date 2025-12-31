/**
 * @packageDocumentation
 * @module models/message/read
 * @since 1.0.0 (2025-12-15)
 * @author Z-kali
 * @description 消息已读回执模型，记录用户对消息的阅读时间
 */

import type { Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";
import { Message } from "./index";
import { User } from "../admin/user";

/**
 * @interface MessageReadAttributes
 * @description 已读回执表字段定义
 * @property {number} id - 主键 ID
 * @property {number} messageId - 消息 ID（Message.id）
 * @property {string} userId - 已读用户 ID（User.id）
 * @property {Date} readAt - 阅读时间
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 */
interface MessageReadAttributes {
  id: number;
  messageId: number;
  conversationId: number;
  userId: string;
  readAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type MessageReadCreationAttributes = Optional<MessageReadAttributes, "id" | "readAt" | "conversationId" | "createdAt" | "updatedAt">;

/**
 * @class MessageRead
 * @description 已读回执模型类，映射数据库 message_reads 表
 */
export class MessageRead
  extends Model<MessageReadAttributes, MessageReadCreationAttributes>
  implements MessageReadAttributes
{
  declare id: number;
  declare messageId: number;
  declare conversationId: number;
  declare userId: string;
  declare readAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

/**
 * @function initMessageRead
 * @description 初始化 MessageRead 模型并建立关联
 * @param {Sequelize} sequelize - Sequelize 实例
 * @returns {typeof MessageRead} 模型类
 */
export function initMessageRead(sequelize: Sequelize): typeof MessageRead {
  MessageRead.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true, comment: "主键 ID" },
      messageId: { type: DataTypes.BIGINT, allowNull: false, comment: "消息 ID（关联 Message.id）" },
      conversationId: { type: DataTypes.BIGINT, allowNull: false, comment: "会话 ID" },
      userId: { type: DataTypes.STRING(11), allowNull: false, comment: "已读用户 ID（User.id）" },
      readAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, comment: "阅读时间" },
    },
    {
      sequelize,
      tableName: "message_reads",
      comment: "消息已读回执（唯一键：messageId+userId）",
      indexes: [
        { fields: ["messageId"] },
        { fields: ["userId"] },
        { fields: ["conversationId"] }, // 新增索引
        { unique: true, fields: ["messageId", "userId"] },
        { fields: ["conversationId", "userId"] }, // 会话已读进度
        { fields: ["messageId", "readAt"] }, // 消息已读时间排序
      ],
    }
  );

  return MessageRead;
}
