/**
 * @packageDocumentation
 * @module models/system/feature/audit
 * @since 1.0.0
 * @author Z-kali
 * @description 功能开关变更审计
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface FeatureAuditLogAttributes {
  id: number;
  featureKey: string;
  action: "create" | "update" | "delete";
  oldValue: string | null; // JSON
  newValue: string | null; // JSON
  operatorId: string;
  createdAt: Date;
}

export type FeatureAuditLogCreationAttributes = Optional<FeatureAuditLogAttributes, "id" | "oldValue" | "newValue" | "createdAt">;

export class FeatureAuditLog extends Model<FeatureAuditLogAttributes, FeatureAuditLogCreationAttributes> implements FeatureAuditLogAttributes {
  declare id: number;
  declare featureKey: string;
  declare action: "create" | "update" | "delete";
  declare oldValue: string | null;
  declare newValue: string | null;
  declare operatorId: string;
  declare createdAt: Date;
}

export function initFeatureAuditLog(sequelize: Sequelize): typeof FeatureAuditLog {
  FeatureAuditLog.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      featureKey: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      oldValue: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      newValue: {
        type: DataTypes.TEXT,
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
      tableName: "feature_audit_logs",
      updatedAt: false,
      indexes: [
        { fields: ["featureKey"] },
      ],
    }
  );
  return FeatureAuditLog;
}
