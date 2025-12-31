/**
 * @packageDocumentation
 * @module models/safety/report
 * @since 1.0.0
 * @author Z-kali
 * @description 举报记录
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface ReportAttributes {
  id: number;
  reporterId: string;
  targetType: "user" | "group" | "message";
  targetId: string; // userId, groupId, or messageId (string)
  reason: string;
  description: string | null;
  status: "pending" | "resolved" | "rejected";
  result: string | null;
  handlerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportCreationAttributes = Optional<ReportAttributes, "id" | "description" | "result" | "handlerId" | "createdAt" | "updatedAt">;

export class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  declare id: number;
  declare reporterId: string;
  declare targetType: "user" | "group" | "message";
  declare targetId: string;
  declare reason: string;
  declare description: string | null;
  declare status: "pending" | "resolved" | "rejected";
  declare result: string | null;
  declare handlerId: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initReport(sequelize: Sequelize): typeof Report {
  Report.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      reporterId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      targetType: {
        type: DataTypes.ENUM("user", "group", "message"),
        allowNull: false,
      },
      targetId: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "resolved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      result: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      handlerId: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "reports",
      indexes: [
        { fields: ["targetType", "targetId"] },
        { fields: ["reporterId"] },
        { fields: ["status"] },
      ],
    }
  );
  return Report;
}
