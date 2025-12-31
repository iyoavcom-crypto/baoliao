/**
 * @packageDocumentation
 * @module models/user-device
 * @since 1.0.0
 * @author Z-kali
 * @description UserDevice 模型
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

/**
 * @interface UserDeviceAttributes
 * @description 用户设备属性
 */
export interface UserDeviceAttributes {
  id: string;
  userId: string;
  deviceId: string;
  platform: string;
  pushToken: string | null;
  lastActiveAt: Date | null;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDeviceCreationAttributes = Optional<UserDeviceAttributes, "id" | "createdAt" | "updatedAt">;

export class UserDevice extends Model<UserDeviceAttributes, UserDeviceCreationAttributes> implements UserDeviceAttributes {
  declare id: string;
  declare userId: string;
  declare deviceId: string;
  declare platform: string;
  declare pushToken: string | null;
  declare lastActiveAt: Date | null;
  declare isOnline: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initUserDevice(sequelize: Sequelize): typeof UserDevice {
  UserDevice.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "用户ID",
        references: { model: "user", key: "id" },
        onDelete: "CASCADE",
      },
      deviceId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: "设备唯一标识（全局唯一）",
      },
      platform: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "平台: ios/android/web/desktop",
      },
      pushToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "推送Token",
      },
      lastActiveAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "最后活跃时间",
      },
      isOnline: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "是否在线",
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "user_devices",
      indexes: [
        { fields: ["userId"] },
        { fields: ["deviceId"], unique: true }, // 设备ID全局唯一
      ],
    }
  );
  return UserDevice;
}
