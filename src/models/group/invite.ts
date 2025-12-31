/**
 * @packageDocumentation
 * @module models/group/invite
 * @since 1.0.0
 * @author Z-kali
 * @description 群组邀请记录 (链接/二维码)
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface GroupInviteAttributes {
  id: number;
  groupId: number;
  creatorId: string;
  code: string; // 邀请码/Token
  type: "link" | "qrcode";
  uses: number;
  maxUses: number | null; // null = 无限
  expiresAt: Date | null;
  createdAt: Date;
}

export type GroupInviteCreationAttributes = Optional<GroupInviteAttributes, "id" | "uses" | "maxUses" | "expiresAt" | "createdAt">;

export class GroupInvite extends Model<GroupInviteAttributes, GroupInviteCreationAttributes> implements GroupInviteAttributes {
  declare id: number;
  declare groupId: number;
  declare creatorId: string;
  declare code: string;
  declare type: "link" | "qrcode";
  declare uses: number;
  declare maxUses: number | null;
  declare expiresAt: Date | null;
  declare createdAt: Date;
}

export function initGroupInvite(sequelize: Sequelize): typeof GroupInvite {
  GroupInvite.init(
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
      creatorId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM("link", "qrcode"),
        allowNull: false,
      },
      uses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      maxUses: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "group_invites",
      updatedAt: false,
      indexes: [
        { fields: ["code"], unique: true },
        { fields: ["groupId"] },
      ],
    }
  );
  return GroupInvite;
}
