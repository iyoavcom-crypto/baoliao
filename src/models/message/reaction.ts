/**
 * @packageDocumentation
 * @module models/message/reaction
 * @since 1.0.0 (2025-12-15)
 * @author Z-kali
 * @description 消息表情/反应模型：支持去重（同用户对同消息同表情唯一）
 */

import type { Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

/**
 * @interface MessageReactionAttributes
 * @description 消息反应表字段定义
 * @property {number} id - 主键 ID
 * @property {number} messageId - 消息 ID（Message.id）
 * @property {string} userId - 反应用户 ID（User.id）
 * @property {string} emoji - 表情键（如 👍、:heart:、unicode 或自定义别名）
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 */
interface MessageReactionAttributes {
  id: number;
  messageId: number;
  userId: string;
  emoji: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type MessageReactionCreationAttributes = Optional<MessageReactionAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * @class MessageReaction
 * @description 消息反应模型类，映射数据库 message_reactions 表
 */
export class MessageReaction
  extends Model<MessageReactionAttributes, MessageReactionCreationAttributes>
  implements MessageReactionAttributes
{
  declare id: number;
  declare messageId: number;
  declare userId: string;
  declare emoji: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

/**
 * @function initMessageReaction
 * @description 初始化 MessageReaction 模型并建立关联
 * @param {Sequelize} sequelize - Sequelize 实例
 * @returns {typeof MessageReaction} 模型类
 */
export function initMessageReaction(sequelize: Sequelize): typeof MessageReaction {
  MessageReaction.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true, comment: "主键 ID" },
      messageId: { type: DataTypes.BIGINT, allowNull: false, comment: "消息 ID（关联 Message.id）" },
      userId: { type: DataTypes.STRING(11), allowNull: false, comment: "反应用户 ID（User.id）" },
      emoji: { type: DataTypes.STRING(64), allowNull: false, comment: "表情键（unicode 或自定义别名）" },
    },
    {
      sequelize,
      tableName: "message_reactions",
      comment: "消息反应（唯一键：messageId+userId+emoji）",
      indexes: [
        { fields: ["messageId"] },
        { fields: ["userId"] },
        { unique: true, fields: ["messageId", "userId", "emoji"] },
        { fields: ["messageId", "emoji"] }, // 统计表情数量
        { fields: ["userId", "createdAt"] }, // 用户表情历史
      ],
    }
  );

  return MessageReaction;
}
