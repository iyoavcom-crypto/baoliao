/**
 * @packageDocumentation
 * @module models/message/delivery
 * @since 1.0.0
 * @author Z-kali
 * @description 消息投递状态表
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export type MessageDeliveryStatus = "queued" | "sent" | "delivered" | "failed";

export interface MessageDeliveryAttributes {
  id: number;
  messageId: number; // Message.id (BIGINT)
  toUserId: string;
  toDeviceId: string | null;
  status: MessageDeliveryStatus;
  attempts: number;
  lastAttemptAt: Date | null;
  deliveredAt: Date | null;
  failReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDeliveryCreationAttributes = Optional<
  MessageDeliveryAttributes,
  "id" | "toDeviceId" | "attempts" | "lastAttemptAt" | "deliveredAt" | "failReason" | "createdAt" | "updatedAt"
>;

export class MessageDelivery extends Model<MessageDeliveryAttributes, MessageDeliveryCreationAttributes> implements MessageDeliveryAttributes {
  declare id: number;
  declare messageId: number;
  declare toUserId: string;
  declare toDeviceId: string | null;
  declare status: MessageDeliveryStatus;
  declare attempts: number;
  declare lastAttemptAt: Date | null;
  declare deliveredAt: Date | null;
  declare failReason: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initMessageDelivery(sequelize: Sequelize): typeof MessageDelivery {
  MessageDelivery.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      messageId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "消息ID",
      },
      toUserId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "接收人ID",
      },
      toDeviceId: {
        type: DataTypes.UUID, // UserDevice.id is UUID
        allowNull: true,
        comment: "接收设备ID (可选，若精确推送到设备)",
      },
      status: {
        type: DataTypes.ENUM("queued", "sent", "delivered", "failed"),
        allowNull: false,
        defaultValue: "queued",
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "重试次数",
      },
      lastAttemptAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      failReason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "message_deliveries",
      indexes: [
        { fields: ["messageId"] },
        { fields: ["toUserId"] },
        { fields: ["status"] },
        { fields: ["toUserId", "status"] }, // 查询用户待投递消息
        { fields: ["status", "lastAttemptAt"] }, // 重试队列查询
      ],
    }
  );
  return MessageDelivery;
}
