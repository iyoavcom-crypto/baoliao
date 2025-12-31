/**
 * @packageDocumentation
 * @module models/safety/rate-limit-log
 * @since 1.0.0
 * @author Z-kali
 * @description 频控触发记录 (审计用)
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface RateLimitLogAttributes {
  id: number;
  ip: string | null;
  userId: string | null;
  endpoint: string;
  count: number;
  limit: number;
  createdAt: Date;
}

export type RateLimitLogCreationAttributes = Optional<RateLimitLogAttributes, "id" | "ip" | "userId" | "createdAt">;

export class RateLimitLog extends Model<RateLimitLogAttributes, RateLimitLogCreationAttributes> implements RateLimitLogAttributes {
  declare id: number;
  declare ip: string | null;
  declare userId: string | null;
  declare endpoint: string;
  declare count: number;
  declare limit: number;
  declare createdAt: Date;
}

export function initRateLimitLog(sequelize: Sequelize): typeof RateLimitLog {
  RateLimitLog.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      ip: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      endpoint: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "rate_limit_logs",
      updatedAt: false,
      indexes: [
        { fields: ["createdAt"] }, // TTL Cleanup
      ],
    }
  );
  return RateLimitLog;
}
