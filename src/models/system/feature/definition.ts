/**
 * @packageDocumentation
 * @module models/system/feature/definition
 * @since 1.0.0
 * @author Z-kali
 * @description 功能特性定义表
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface FeatureDefinitionAttributes {
  key: string; // e.g., "im.group.create"
  name: string;
  description: string | null;
  defaultValue: boolean; // 默认开关状态
  createdAt: Date;
  updatedAt: Date;
}

export type FeatureDefinitionCreationAttributes = Optional<FeatureDefinitionAttributes, "description" | "createdAt" | "updatedAt">;

export class FeatureDefinition extends Model<FeatureDefinitionAttributes, FeatureDefinitionCreationAttributes> implements FeatureDefinitionAttributes {
  declare key: string;
  declare name: string;
  declare description: string | null;
  declare defaultValue: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initFeatureDefinition(sequelize: Sequelize): typeof FeatureDefinition {
  FeatureDefinition.init(
    {
      key: {
        type: DataTypes.STRING(64),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      defaultValue: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "feature_definitions",
    }
  );
  return FeatureDefinition;
}
