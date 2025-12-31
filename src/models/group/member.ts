/**
 * @packageDocumentation
 * @module models/group/member
 * @since 1.0.0 (2025-12-15)
 * @author Z-kali
 * @description 群组成员模型定义，记录进群方式与禁言状态
 */

import type { Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

type JoinMethod = "invited" | "search";

/**
 * @interface GroupMemberAttributes
 * @description 群成员模型属性
 * @property {number} id - 主键 ID
 * @property {number} groupId - 群组 ID（Group.id）
 * @property {string} userId - 成员 User.id（字符串）
 * @property {Date} joinedAt - 进群时间
 * @property {"invited"|"search"} joinMethod - 进群方式（邀请/搜索）
 * @property {string|null} [invitedBy] - 邀请人 User.id（joinMethod 为 invited 时可用）
 * @property {boolean} muted - 是否被禁言
 * @property {Date|null} [mutedUntil] - 禁言截止时间（null 不限期或未禁言）
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 */
interface GroupMemberAttributes {
  id: number;
  groupId: number;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  nicknameInGroup?: string | null;
  joinedAt: Date;
  joinMethod: JoinMethod;
  invitedBy?: string | null;
  muted: boolean;
  mutedUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type GroupMemberCreationAttributes = Optional<
  GroupMemberAttributes,
  "id" | "role" | "nicknameInGroup" | "joinedAt" | "invitedBy" | "muted" | "mutedUntil" | "createdAt" | "updatedAt"
>;

/**
 * @class GroupMember
 * @description 群成员模型类，映射数据库 group_members 表
 */
export class GroupMember
  extends Model<GroupMemberAttributes, GroupMemberCreationAttributes>
  implements GroupMemberAttributes
{
  declare id: number;
  declare groupId: number;
  declare userId: string;
  declare role: 'owner' | 'admin' | 'member';
  declare nicknameInGroup: string | null;
  declare joinedAt: Date;
  declare joinMethod: JoinMethod;
  declare invitedBy: string | null;
  declare muted: boolean;
  declare mutedUntil: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

/**
 * @function initGroupMember
 * @description 初始化 GroupMember 模型
 * @param {Sequelize} sequelize - Sequelize 实例
 * @returns {typeof GroupMember} 模型类
 */
export function initGroupMember(sequelize: Sequelize): typeof GroupMember {
  GroupMember.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: "主键 ID",
      },
      groupId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "群组 ID（关联 Group.id）",
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "成员 User.id（字符串）",
      },
      role: {
        type: DataTypes.ENUM('owner', 'admin', 'member'),
        allowNull: false,
        defaultValue: 'member',
        comment: "角色",
      },
      nicknameInGroup: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: "群内昵称",
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "进群时间（默认当前时间）",
      },
      joinMethod: {
        type: DataTypes.ENUM("invited", "search"),
        allowNull: false,
        comment: "进群方式（invited：被邀请；search：搜索加入）",
      },
      invitedBy: {
        type: DataTypes.STRING(11),
        allowNull: true,
        comment: "邀请人 User.id（joinMethod=invited 时记录）",
      },
      muted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否被禁言（true：禁言）",
      },
      mutedUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "禁言截止时间（null 表示未设置或不限期）",
      },
    },
    {
      sequelize,
      tableName: "group_members",
      comment: "群组成员表（进群方式与禁言状态）",
      indexes: [
        { fields: ["groupId"] },
        { fields: ["userId"] },
        { unique: true, fields: ["groupId", "userId"] },
        { fields: ["groupId", "role"] }, // 查询群管理员
        { fields: ["groupId", "muted"] }, // 查询被禁言成员
        { fields: ["userId", "joinedAt"] }, // 用户加群历史
      ],
    }
  );

  return GroupMember;
}
