/**
 * @packageDocumentation
 * @module models/group/event
 * @since 1.0.0
 * @author Z-kali
 * @description 群组事件审计 (踢人、禁言、改名、公告等)
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface GroupEventAttributes {
  id: number;
  groupId: number;
  operatorId: string;
  action: string; // kick, mute, update_info, etc.
  targetId?: string | null; // 被操作人
  details?: string | null; // JSON details
  createdAt: Date;
}

export type GroupEventCreationAttributes = Optional<GroupEventAttributes, "id" | "targetId" | "details" | "createdAt">;

export class GroupEvent extends Model<GroupEventAttributes, GroupEventCreationAttributes> implements GroupEventAttributes {
  declare id: number;
  declare groupId: number;
  declare operatorId: string;
  declare action: string;
  declare targetId: string | null;
  declare details: string | null;
  declare createdAt: Date;
}

export function initGroupEvent(sequelize: Sequelize): typeof GroupEvent {
  GroupEvent.init(
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
      operatorId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      targetId: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "group_events",
      updatedAt: false,
      indexes: [
        { fields: ["groupId"] },
        { fields: ["operatorId"] },
        { fields: ["groupId", "createdAt"] }, // 群事件历史
        { fields: ["operatorId", "createdAt"] }, // 操作者事件查询
        { fields: ["action"] }, // 按动作类型查询
      ],
    }
  );
  return GroupEvent;
}
