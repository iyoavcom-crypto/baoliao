/**
 * @packageDocumentation
 * @module models/user/friend
 * @since 1.0.0 (2025-12-15)
 * @author Z-kali
 * @description 用户好友关系模型：请求、通过、拒绝、拉黑
 */

import type { Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

type FriendStatus = "pending" | "accepted" | "rejected" | "blocked";

/**
 * @interface UserFriendAttributes
 * @description 好友关系表字段定义（方向性：userId 的视角）
 * @property {number} id - 主键 ID
 * @property {string} userId - 当前用户 ID（视图所有者）
 * @property {string} friendId - 对方用户 ID
 * @property {"pending"|"accepted"|"rejected"|"blocked"} status - 关系状态
 * @property {string|null} [requestedBy] - 发起方用户 ID（请求/拉黑）
 * @property {Date} requestedAt - 请求时间
 * @property {Date|null} [respondedAt] - 响应时间（通过/拒绝）
 * @property {string|null} [remark] - 备注（对好友的私有备注）
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 */
export interface UserFriendAttributes {
  id: number;
  userId: string;
  friendId: string;
  status: FriendStatus;
  requestedBy?: string | null;
  blockedBy?: string | null;
  blockReason?: string | null;
  source?: string | null;
  requestedAt: Date;
  respondedAt?: Date | null;
  remark?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserFriendCreationAttributes = Optional<
  UserFriendAttributes,
  | "id"
  | "requestedBy"
  | "blockedBy"
  | "blockReason"
  | "source"
  | "requestedAt"
  | "respondedAt"
  | "remark"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class UserFriend
 * @description 用户好友关系模型类，映射数据库 user_friends 表
 */
export class UserFriend
  extends Model<UserFriendAttributes, UserFriendCreationAttributes>
  implements UserFriendAttributes
{
  declare id: number;
  declare userId: string;
  declare friendId: string;
  declare status: FriendStatus;
  declare requestedBy: string | null;
  declare blockedBy: string | null;
  declare blockReason: string | null;
  declare source: string | null;
  declare requestedAt: Date;
  declare respondedAt: Date | null;
  declare remark: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

/**
 * @function initUserFriend
 * @description 初始化 UserFriend 模型并建立关联
 * @param {Sequelize} sequelize - Sequelize 实例
 * @returns {typeof UserFriend} 模型类
 */
export function initUserFriend(sequelize: Sequelize): typeof UserFriend {
  UserFriend.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: "主键 ID",
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "当前用户 ID（视角所有者）",
      },
      friendId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "对方用户 ID",
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected", "blocked"),
        allowNull: false,
        defaultValue: "pending",
        comment: "关系状态：pending/accepted/rejected/blocked",
      },
      requestedBy: {
        type: DataTypes.STRING(11),
        allowNull: true,
        comment: "发起方用户 ID（请求/拉黑）",
      },
      blockedBy: {
        type: DataTypes.STRING(11),
        allowNull: true,
        comment: "拉黑方用户 ID",
      },
      blockReason: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "拉黑原因",
      },
      source: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: "来源 (search/qrcode/group/card)",
      },
      requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "请求时间",
      },
      respondedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "响应时间（通过/拒绝）",
      },
      remark: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "备注（对好友的私有备注）",
      },
    },
    {
      sequelize,
      tableName: "user_friends",
      comment: "用户好友关系（方向性记录，便于不同视角的备注与屏蔽）",
      indexes: [
        { fields: ["userId"] },
        { fields: ["friendId"] },
        { unique: true, fields: ["userId", "friendId"] },
        { fields: ["userId", "status"] }, // 查询用户好友列表（按状态）
        { fields: ["friendId", "status"] }, // 反向查询（谁把我加为好友）
      ],
    }
  );

  return UserFriend;
}
