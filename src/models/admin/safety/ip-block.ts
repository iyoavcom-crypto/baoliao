/**
 * @packageDocumentation
 * @module models/safety/ip-block
 * @since 1.0.0
 * @author Z-kali
 * @description IP/设备黑名单
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface IpBlockAttributes {
  id: number;
  type: "ip" | "device";
  value: string; // IP or DeviceID
  reason: string;
  expiresAt: Date | null;
  operatorId: string;
  createdAt: Date;
}

export type IpBlockCreationAttributes = Optional<IpBlockAttributes, "id" | "expiresAt" | "createdAt">;

export class IpBlock extends Model<IpBlockAttributes, IpBlockCreationAttributes> implements IpBlockAttributes {
  declare id: number;
  declare type: "ip" | "device";
  declare value: string;
  declare reason: string;
  declare expiresAt: Date | null;
  declare operatorId: string;
  declare createdAt: Date;
}

export function initIpBlock(sequelize: Sequelize): typeof IpBlock {
  IpBlock.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM("ip", "device"),
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
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
      tableName: "ip_blocks",
      updatedAt: false,
      indexes: [
        { fields: ["type", "value"], unique: true },
        { fields: ["expiresAt"] }, // 过期清理
        { fields: ["type"] }, // 按类型查询
      ],
    }
  );
  return IpBlock;
}
