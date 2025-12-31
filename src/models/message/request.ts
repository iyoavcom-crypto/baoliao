/**
 * @packageDocumentation
 * @module models/message/request
 * @since 1.0.0
 * @author Z-kali
 * @description 陌生人消息请求表
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export type MessageRequestStatus = "pending" | "accepted" | "rejected" | "expired";

export interface MessageRequestAttributes {
  id: number;
  fromUserId: string;
  toUserId: string;
  firstMessagePreview: string | null;
  status: MessageRequestStatus;
  createdAt: Date;
  respondedAt: Date | null;
}

export type MessageRequestCreationAttributes = Optional<MessageRequestAttributes, "id" | "firstMessagePreview" | "createdAt" | "respondedAt">;

export class MessageRequest extends Model<MessageRequestAttributes, MessageRequestCreationAttributes> implements MessageRequestAttributes {
  declare id: number;
  declare fromUserId: string;
  declare toUserId: string;
  declare firstMessagePreview: string | null;
  declare status: MessageRequestStatus;
  declare createdAt: Date;
  declare respondedAt: Date | null;
}

export function initMessageRequest(sequelize: Sequelize): typeof MessageRequest {
  MessageRequest.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      fromUserId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      toUserId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      firstMessagePreview: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected", "expired"),
        allowNull: false,
        defaultValue: "pending",
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      respondedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      tableName: "message_requests",
      updatedAt: false,
      indexes: [
        { fields: ["toUserId", "status"] },
        { fields: ["fromUserId", "toUserId"], unique: true }, // 同一对用户只有一个活跃请求？或者只保留最新？这里假设唯一
      ],
    }
  );
  return MessageRequest;
}
