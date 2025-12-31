/**
 * @packageDocumentation
 * @module models/system/feature/policy
 * @since 1.0.0
 * @author Z-kali
 * @description 功能特性策略表 (针对用户/角色/群组的开关)
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface FeaturePolicyAttributes {
  id: number;
  featureKey: string;
  targetType: "global" | "user" | "role" | "group";
  targetId: string; // "all", userId, roleId, groupId
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type FeaturePolicyCreationAttributes = Optional<FeaturePolicyAttributes, "id" | "createdAt" | "updatedAt">;

export class FeaturePolicy extends Model<FeaturePolicyAttributes, FeaturePolicyCreationAttributes> implements FeaturePolicyAttributes {
  declare id: number;
  declare featureKey: string;
  declare targetType: "global" | "user" | "role" | "group";
  declare targetId: string;
  declare enabled: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initFeaturePolicy(sequelize: Sequelize): typeof FeaturePolicy {
  FeaturePolicy.init(
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
      targetType: {
        type: DataTypes.ENUM("global", "user", "role", "group"),
        allowNull: false,
      },
      targetId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: "'all' for global",
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "feature_policies",
      indexes: [
        { fields: ["featureKey", "targetType", "targetId"], unique: true },
      ],
    }
  );
  return FeaturePolicy;
}
