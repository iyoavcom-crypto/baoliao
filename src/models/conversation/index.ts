/**
 * @packageDocumentation
 * @module database/models/Conversation
 * @since 1.0.0 (2025-12-14)
 * @author Z-kali
 * @description 会话模型定义：平台公告、群主群发、私聊、群聊
 * @path src/database/models/Conversation.ts
 */


import type { Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

/**
 * @interface ConversationAttributes
 * @description 会话模型属性接口
 * @property {number} id - 会话主键 ID
 * @property {string} convId - 会话唯一标识符 (UUID)
 * @property {'system'|'group_broadcast'|'direct'|'group'} kind - 会话类型
 * @property {string} [title] - 会话标题（公告/群发通知用）
 * @property {string} [senderId] - 发送方 User.id（平台或群主）
 * @property {string} [directKey] - 单聊唯一键，用于快速查找 (e.g., smallId_bigId)
 * @property {number} [groupId] - 关联的群组 ID（仅群聊有效）
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 */
interface ConversationAttributes {
  id: number;
  convId: string;
  kind: 'system' | 'group_broadcast' | 'direct' | 'group';
  title?: string;
  senderId?: string;
  directKey?: string;
  directUserA?: string;
  directUserB?: string;
  lastMessageId?: number;
  lastMessageAt?: Date;
  groupId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * @interface ConversationCreationAttributes
 * @description 创建会话时的可选属性
 */
interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'title' | 'senderId' | 'directKey' | 'directUserA' | 'directUserB' | 'lastMessageId' | 'lastMessageAt' | 'groupId' | 'createdAt' | 'updatedAt'> {}

/**
 * @class Conversation
 * @description 会话模型类，映射数据库 conversations 表
 */
export class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: number;
  public convId!: string;
  public kind!: 'system' | 'group_broadcast' | 'direct' | 'group';
  public title!: string;
  public senderId!: string;
  public directKey!: string;
  public directUserA!: string;
  public directUserB!: string;
  public lastMessageId!: number;
  public lastMessageAt!: Date;
  public groupId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * @function initConversation
 * @description 初始化 Conversation 模型
 * @param {Sequelize} sequelize - Sequelize 实例
 */
export function initConversation(sequelize: Sequelize) {
  Conversation.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: "主键 ID",
      },
      convId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: "会话唯一标识符（UUID）",
      },
      kind: {
        type: DataTypes.ENUM('system', 'group_broadcast', 'direct', 'group'),
        allowNull: false,
        comment: "会话类型：system（平台公告）| group_broadcast（群主群发）| direct（私聊）| group（群聊）",
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "标题（公告/群发通知）",
      },
      senderId: {
        type: DataTypes.STRING(11),
        allowNull: true,
        comment: "发送方 User.id（平台或群主）",
      },
      directKey: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        comment: "单聊唯一键（如 userA_userB；便于快速查找）",
      },
      directUserA: {
        type: DataTypes.STRING(11),
        allowNull: true,
        comment: "单聊用户A",
      },
      directUserB: {
        type: DataTypes.STRING(11),
        allowNull: true,
        comment: "单聊用户B",
      },
      lastMessageId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "最后一条消息ID (messages.id)",
      },
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "最后一条消息时间",
      },
      groupId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "群聊对应的 Group.id（仅 kind=group 或 group_broadcast 有效）",
      },
    },
    {
      sequelize,
      tableName: 'conversations',
      comment: '会话表（平台公告/群发/私聊/群聊）',
      indexes: [
        {
          unique: true,
          fields: ['convId'],
        },
        {
          unique: true,
          fields: ['directKey'],
        },
        {
          fields: ['groupId'],
        },
        {
          fields: ['senderId'],
        },
      ],
    }
  );
  return Conversation;
}
