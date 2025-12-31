/**
 * @packageDocumentation
 * @module models/conversation/member
 * @since 1.0.0 (2025-12-15)
 * @author Z-kali
 * @description 会话成员模型：参与者角色、加入/离开、阅读进度、通知偏好与置顶/归档
 */

import type { Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

type ParticipantRole = "owner" | "admin" | "member";
type NotificationPref = "all" | "mentions" | "none";

/**
 * @interface ConversationMemberAttributes
 * @description 会话成员表字段定义
 * @property {number} id - 主键 ID
 * @property {number} conversationId - 会话 ID（Conversation.id）
 * @property {string} userId - 成员用户 ID（User.id）
 * @property {"owner"|"admin"|"member"} role - 成员角色
 * @property {Date} joinedAt - 加入时间
 * @property {Date|null} [leftAt] - 离开时间（可空）
 * @property {Date|null} [lastReadAt] - 最近阅读时间（可空）
 * @property {number|null} [lastReadMessageId] - 最近阅读消息 ID（可空）
 * @property {boolean} muted - 是否静音
 * @property {Date|null} [mutedUntil] - 静音截止时间（可空）
 * @property {"all"|"mentions"|"none"} notificationPref - 通知偏好
 * @property {boolean} pinned - 是否置顶该会话
 * @property {Date|null} [archivedAt] - 归档时间（可空）
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 */
interface ConversationMemberAttributes {
  id: number;
  conversationId: number;
  userId: string;
  role: ParticipantRole;
  joinedAt: Date;
  leftAt?: Date | null;
  lastReadAt?: Date | null;
  lastReadMessageId?: number | null;
  unreadCount: number;
  lastDeliveredMessageId?: number | null;
  draft?: string | null;
  clientCursor?: string | null;
  muted: boolean;
  mutedUntil?: Date | null;
  notificationPref: NotificationPref;
  pinned: boolean;
  archivedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ConversationMemberCreationAttributes = Optional<
  ConversationMemberAttributes,
  | "id"
  | "role"
  | "joinedAt"
  | "leftAt"
  | "lastReadAt"
  | "lastReadMessageId"
  | "unreadCount"
  | "lastDeliveredMessageId"
  | "draft"
  | "clientCursor"
  | "muted"
  | "mutedUntil"
  | "notificationPref"
  | "pinned"
  | "archivedAt"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class ConversationMember
 * @description 会话成员模型类，映射数据库 conversation_members 表
 */
export class ConversationMember
  extends Model<ConversationMemberAttributes, ConversationMemberCreationAttributes>
  implements ConversationMemberAttributes
{
  declare id: number;
  declare conversationId: number;
  declare userId: string;
  declare role: ParticipantRole;
  declare joinedAt: Date;
  declare leftAt: Date | null;
  declare lastReadAt: Date | null;
  declare lastReadMessageId: number | null;
  declare unreadCount: number;
  declare lastDeliveredMessageId: number | null;
  declare draft: string | null;
  declare clientCursor: string | null;
  declare muted: boolean;
  declare mutedUntil: Date | null;
  declare notificationPref: NotificationPref;
  declare pinned: boolean;
  declare archivedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

/**
 * @function initConversationMember
 * @description 初始化 ConversationMember 模型并建立关联
 * @param {Sequelize} sequelize - Sequelize 实例
 * @returns {typeof ConversationMember} 模型类
 */
export function initConversationMember(sequelize: Sequelize): typeof ConversationMember {
  ConversationMember.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true, comment: "主键 ID" },
      conversationId: { type: DataTypes.BIGINT, allowNull: false, comment: "会话 ID（关联 Conversation.id）" },
      userId: { type: DataTypes.STRING(11), allowNull: false, comment: "成员用户 ID（User.id）" },
      role: {
        type: DataTypes.ENUM("owner", "admin", "member"),
        allowNull: false,
        defaultValue: "member",
        comment: "成员角色：owner|admin|member",
      },
      joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, comment: "加入时间" },
      leftAt: { type: DataTypes.DATE, allowNull: true, comment: "离开时间（可空）" },
      lastReadAt: { type: DataTypes.DATE, allowNull: true, comment: "最近阅读时间（可空）" },
      lastReadMessageId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "最近阅读消息 ID（可空）",
      },
      unreadCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "未读消息数",
      },
      lastDeliveredMessageId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "送达到本端的游标 (Message.id)",
      },
      draft: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "草稿内容",
      },
      clientCursor: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "增量同步游标",
      },
      muted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否静音",
      },
      mutedUntil: { type: DataTypes.DATE, allowNull: true, comment: "静音截止时间（可空）" },
      notificationPref: {
        type: DataTypes.ENUM("all", "mentions", "none"),
        allowNull: false,
        defaultValue: "all",
        comment: "通知偏好：全部/仅@我/不通知",
      },
      pinned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "是否置顶该会话" },
      archivedAt: { type: DataTypes.DATE, allowNull: true, comment: "归档时间（可空）" },
    },
    {
      sequelize,
      tableName: "conversation_members",
      comment: "会话成员表（参与者与阅读进度、通知偏好）",
      indexes: [
        { fields: ["conversationId"] },
        { fields: ["userId"] },
        { unique: true, fields: ["conversationId", "userId"] },
        { fields: ["lastReadAt"] },
        { fields: ["mutedUntil"] },
        { fields: ["userId", "pinned", "archivedAt"] }, // 用户会话列表（置顶+未归档）
        { fields: ["conversationId", "leftAt"] }, // 会话活跃成员（未离开）
      ],
    }
  );

  return ConversationMember;
}

