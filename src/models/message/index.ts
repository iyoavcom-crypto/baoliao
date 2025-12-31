/**
 * @packageDocumentation
 * @module models/message
 * @since 1.0.0 (2025-12-15)
 * @author Z-kali
 * @description 消息模型：文本、图片、文件与系统消息，含编辑与删除状态
 */

import type { Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

type MessageKind = "text" | "image" | "file" | "system";

/**
 * @interface Attachment
 * @description 消息附件对象
 * @property {string} url - 附件地址
 * @property {string} [name] - 附件名称
 * @property {string} [type] - MIME 类型
 * @property {number} [size] - 字节大小
 */
interface Attachment {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}

/**
 * @interface MessageAttributes
 * @description 消息表字段定义
 * @property {number} id - 主键 ID
 * @property {string} msgId - 业务消息 ID（去重与引用）
 * @property {number} conversationId - 会话 ID（Conversation.id）
 * @property {string} senderId - 发送方用户 ID（User.id）
 * @property {"text"|"image"|"file"|"system"} kind - 消息类型
 * @property {string} [content] - 文本内容
 * @property {Attachment[]} [attachments] - 附件列表
 * @property {string[]} [mentionedUserIds] - 提及用户 ID 列表
 * @property {number|null} [repliedMessageId] - 回复消息 ID
 * @property {boolean} edited - 是否被编辑
 * @property {Date|null} [editedAt] - 编辑时间
 * @property {boolean} deleted - 是否已删除
 * @property {Date|null} [deletedAt] - 删除时间
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 */
interface MessageAttributes {
  id: number;
  msgId: string;
  conversationId: number;
  senderId: string;
  kind: MessageKind;
  content?: string;
  attachments?: Attachment[];
  mentionedUserIds?: string[];
  repliedMessageId?: number | null;
  clientMsgId?: string;
  seq?: number;
  serverReceivedAt?: Date;
  deletedForAll: boolean;
  recallBy?: string | null;
  recalledAt?: Date | null;
  recallReason?: string | null;
  edited: boolean;
  editedAt?: Date | null;
  deleted: boolean;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type MessageCreationAttributes = Optional<
  MessageAttributes,
  | "id"
  | "content"
  | "attachments"
  | "mentionedUserIds"
  | "repliedMessageId"
  | "clientMsgId"
  | "seq"
  | "serverReceivedAt"
  | "deletedForAll"
  | "recallBy"
  | "recalledAt"
  | "recallReason"
  | "edited"
  | "editedAt"
  | "deleted"
  | "deletedAt"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class Message
 * @description 消息模型类，映射数据库 messages 表
 */
export class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes
{
  declare id: number;
  declare msgId: string;
  declare conversationId: number;
  declare senderId: string;
  declare kind: MessageKind;
  declare content: string | undefined;
  declare attachments: Attachment[] | undefined;
  declare mentionedUserIds: string[] | undefined;
  declare repliedMessageId: number | null | undefined;
  declare clientMsgId: string | undefined;
  declare seq: number | undefined;
  declare serverReceivedAt: Date | undefined;
  declare deletedForAll: boolean;
  declare recallBy: string | null | undefined;
  declare recalledAt: Date | null | undefined;
  declare recallReason: string | null | undefined;
  declare edited: boolean;
  declare editedAt: Date | null | undefined;
  declare deleted: boolean;
  declare deletedAt: Date | null | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

/**
 * @function initMessage
 * @description 初始化 Message 模型并建立关联
 * @param {Sequelize} sequelize - Sequelize 实例
 * @returns {typeof Message} 模型类
 */
export function initMessage(sequelize: Sequelize): typeof Message {
  Message.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true, comment: "主键 ID" },
      msgId: { type: DataTypes.STRING, allowNull: false, unique: true, comment: "业务消息 ID（去重与引用）" },
      conversationId: { 
        type: DataTypes.BIGINT, 
        allowNull: false, 
        comment: "会话ID（关联 Conversation.id）",
        references: {
          model: "conversations",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      senderId: { 
        type: DataTypes.STRING(11), 
        allowNull: false, 
        comment: "发送方用户ID（User.id）",
        references: {
          model: "user",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      kind: {
        type: DataTypes.ENUM("text", "image", "file", "system"),
        allowNull: false,
        comment: "消息类型：text|image|file|system",
      },
      content: { type: DataTypes.TEXT, allowNull: true, comment: "文本内容（可空）" },
      attachments: { type: DataTypes.JSON, allowNull: true, defaultValue: [], comment: "附件列表（JSON Attachment[]）" },
      mentionedUserIds: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "提及用户 ID 列表（JSON string[]）",
      },
      repliedMessageId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "回复消息 ID",
      },
      clientMsgId: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: "客户端消息 ID (去重)",
      },
      seq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "会话内序号（增量同步基准）",
      },
      serverReceivedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "服务器接收时间",
      },
      deletedForAll: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否对所有人删除",
      },
      recallBy: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      recalledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      recallReason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      edited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否被编辑",
      },
      editedAt: { type: DataTypes.DATE, allowNull: true, comment: "编辑时间（可空）" },
      deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "是否已删除" },
      deletedAt: { type: DataTypes.DATE, allowNull: true, comment: "删除时间（可空）" },
    },
    {
      sequelize,
      tableName: "messages",
      comment: "消息表（内容、附件、编辑与删除状态）",
      indexes: [
        { fields: ["conversationId"] },
        { fields: ["senderId"] },
        { fields: ["createdAt"] },
        { fields: ["conversationId", "createdAt"] },
        { fields: ["msgId"], unique: true }, // 业务消息ID查询
        { fields: ["conversationId", "seq"], unique: true }, // 会话序号唯一约束
        { fields: ["repliedMessageId"] }, // 回复链查询
        { fields: ["deletedForAll"] }, // 筛选已删除消息
        { fields: ["deleted"] }, // 软删除筛选
        { fields: ["senderId", "createdAt"] }, // 用户发送历史
        { fields: ["conversationId", "deleted", "createdAt"] }, // 会话有效消息
      ],
    }
  );

  return Message;
}
