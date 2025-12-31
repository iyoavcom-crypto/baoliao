/**
 * @packageDocumentation
 * @module models/group/join-request
 * @since 1.0.0
 * @author Z-kali
 * @description 群组加入申请表
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export type GroupJoinRequestStatus = "pending" | "accepted" | "rejected";

export interface GroupJoinRequestAttributes {
  id: number;
  groupId: number;
  userId: string;
  inviterId?: string | null; // 如果是邀请确认
  reason?: string | null;
  status: GroupJoinRequestStatus;
  createdAt: Date;
  handledAt?: Date | null;
  handledBy?: string | null;
}

export type GroupJoinRequestCreationAttributes = Optional<GroupJoinRequestAttributes, "id" | "inviterId" | "reason" | "createdAt" | "handledAt" | "handledBy">;

export class GroupJoinRequest extends Model<GroupJoinRequestAttributes, GroupJoinRequestCreationAttributes> implements GroupJoinRequestAttributes {
  declare id: number;
  declare groupId: number;
  declare userId: string;
  declare inviterId: string | null;
  declare reason: string | null;
  declare status: GroupJoinRequestStatus;
  declare createdAt: Date;
  declare handledAt: Date | null;
  declare handledBy: string | null;
}

export function initGroupJoinRequest(sequelize: Sequelize): typeof GroupJoinRequest {
  GroupJoinRequest.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      groupId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      inviterId: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      handledAt: { type: DataTypes.DATE, allowNull: true },
      handledBy: { type: DataTypes.STRING(11), allowNull: true },
    },
    {
      sequelize,
      tableName: "group_join_requests",
      updatedAt: false,
      indexes: [
        { fields: ["groupId", "status"] },
        { fields: ["userId"] },
        { fields: ["userId", "createdAt"] }, // 用户申请历史
        { fields: ["groupId", "status", "createdAt"] }, // 待审核请求（时间排序）
      ],
    }
  );
  return GroupJoinRequest;
}
