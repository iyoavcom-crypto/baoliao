/**
 * @packageDocumentation
 * @module models/user/friend-request-event
 * @since 1.0.0
 * @author Z-kali
 * @description 好友申请事件审计
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface FriendRequestEventAttributes {
  id: number;
  fromId: string;          // 申请人（与WS协议对齐）
  toId: string;            // 被申请人（与WS协议对齐）
  message: string | null;  // 申请消息
  status: "pending" | "approved" | "rejected" | "ignored";  // 申请状态
  reviewedAt: Date | null; // 处理时间
  reason: string | null;   // 拒绝原因
  createdAt: Date;
  expiresAt: Date;         // 过30天过期
}

export type FriendRequestEventCreationAttributes = Optional<
  FriendRequestEventAttributes,
  "id" | "message" | "status" | "reviewedAt" | "reason" | "createdAt" | "expiresAt"
>;

export class FriendRequestEvent
  extends Model<FriendRequestEventAttributes, FriendRequestEventCreationAttributes>
  implements FriendRequestEventAttributes
{
  declare id: number;
  declare fromId: string;
  declare toId: string;
  declare message: string | null;
  declare status: "pending" | "approved" | "rejected" | "ignored";
  declare reviewedAt: Date | null;
  declare reason: string | null;
  declare createdAt: Date;
  declare expiresAt: Date;
}

export function initFriendRequestEvent(sequelize: Sequelize): typeof FriendRequestEvent {
  FriendRequestEvent.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: "主键",
      },
      fromId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "申请人 ID",
      },
      toId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "接收人 ID",
      },
      message: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "申请消息",
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "pending",
        comment: "申请状态：pending/approved/rejected/ignored",
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "处理时间",
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "拒绝原因",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "创建时间",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "过期时间（30天）",
      },
    },
    {
      sequelize,
      tableName: "friend_request_events",
      updatedAt: false,
      indexes: [
        { fields: ["toId", "status"] },  // 查询待处理申请
        { fields: ["fromId", "toId", "status"] },  // 防止重复申请
        { fields: ["expiresAt"] },  // 定时清理
      ],
      comment: "好友申请记录表",
    }
  );
  return FriendRequestEvent;
}
