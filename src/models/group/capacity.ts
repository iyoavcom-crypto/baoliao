/**
 * @packageDocumentation
 * @module models/group/capacity
 * @since 1.0.0
 * @author Z-kali
 * @description 群组容量变更记录
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface GroupCapacityAttributes {
  id: number;
  groupId: number;
  oldCapacity: number;
  newCapacity: number;
  reason: string | null;
  operatorId: string; // 操作人
  createdAt: Date;
}

export type GroupCapacityCreationAttributes = Optional<GroupCapacityAttributes, "id" | "reason" | "createdAt">;

export class GroupCapacity extends Model<GroupCapacityAttributes, GroupCapacityCreationAttributes> implements GroupCapacityAttributes {
  declare id: number;
  declare groupId: number;
  declare oldCapacity: number;
  declare newCapacity: number;
  declare reason: string | null;
  declare operatorId: string;
  declare createdAt: Date;
}

export function initGroupCapacity(sequelize: Sequelize): typeof GroupCapacity {
  GroupCapacity.init(
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
      oldCapacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      newCapacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      operatorId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "group_capacity",
      updatedAt: false,
      indexes: [
        { fields: ["groupId"] },
      ],
    }
  );
  return GroupCapacity;
}
