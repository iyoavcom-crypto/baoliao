/**
 * @packageDocumentation
 * @module database/models/Group
 * @since 1.0.0 (2025-12-14)
 * @author Z-kali
 * @description 群组模型定义，管理群组的基本信息与状态
 * @path src/database/models/Group.ts
 */

import type { Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

/**
 * @interface GroupAttributes
 * @description 群组模型属性接口
 * @property {number} id - 群组 ID
 * @property {string} name - 群组名称
 * @property {string} [avatarUrl] - 群头像 URL
 * @property {string} [description] - 群简介
 * @property {string} userId - 群主用户 ID
 * @property {string[]} [managerId] - 群管理员 ID
 * @property {string[]} [memberId] - 群成员 ID
 * @property {string} [pinnedMessageId] - 置顶消息 ID
 * @property {'active' | 'dissolved'} status - 群状态：活跃或已解散
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 */
interface GroupAttributes {
  id: number;
  name: string;
  avatarUrl?: string;
  description?: string;
  userId: string;
  // managerId?: string[]; // Deprecated: use GroupMember
  // memberId?: string[]; // Deprecated: use GroupMember
  pinnedMessageId?: number;
  status: 'active' | 'dissolved';
  muteAll: boolean;
  capacity: number;
  capacityUpdatedAt?: Date;
  joinPolicy: 'invite' | 'request' | 'open';
  allowMemberInvite: boolean;
  allowSearchJoin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * @interface GroupCreationAttributes
 * @description 创建群组时的可选属性
 */
interface GroupCreationAttributes extends Optional<GroupAttributes, 'id' | 'avatarUrl' | 'description' | 'pinnedMessageId' | 'capacityUpdatedAt' | 'joinPolicy' | 'allowMemberInvite' | 'allowSearchJoin' | 'createdAt' | 'updatedAt'> {}

/**
 * @class Group
 * @description 群组模型类，映射数据库 groups 表
 */
export class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  public id!: number;
  public name!: string;
  public avatarUrl!: string;
  public description!: string;
  public userId!: string;
  public pinnedMessageId!: number;
  public status!: 'active' | 'dissolved';
  public muteAll!: boolean;
  public capacity!: number;
  public capacityUpdatedAt!: Date;
  public joinPolicy!: 'invite' | 'request' | 'open';
  public allowMemberInvite!: boolean;
  public allowSearchJoin!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * @function initGroup
 * @description 初始化 Group 模型
 * @param {Sequelize} sequelize - Sequelize 实例
 */
export function initGroup(sequelize: Sequelize) {
  Group.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: "主键 ID",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "群组名称",
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "群头像 URL",
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "群简介",
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "群主 User.id（字符串）",
      },
      pinnedMessageId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "置顶消息 ID (messages.id)",
      },
      status: {
        type: DataTypes.ENUM('active', 'dissolved'),
        allowNull: false,
        defaultValue: 'active',
        comment: "群状态",
      },
      muteAll: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否全员禁言",
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 200,
        comment: "群容量",
      },
      capacityUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      joinPolicy: {
        type: DataTypes.ENUM('invite', 'request', 'open'),
        allowNull: false,
        defaultValue: 'invite',
        comment: "加群方式",
      },
      allowMemberInvite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否允许群成员邀请",
      },
      allowSearchJoin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否允许搜索加群",
      },
    },
    {
      sequelize,
      tableName: 'groups',
      comment: '群组表（基础信息与控制设置）',
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['status'],
        },
      ],
    }
  );
  return Group;
}
