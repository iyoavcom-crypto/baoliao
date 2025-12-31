/**
 * @packageDocumentation
 * @module models/ws-connection
 * @since 1.0.0
 * @author Z-kali
 * @description WsConnection 模型 (审计/排障)
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

/**
 * @interface WsConnectionAttributes
 * @description WebSocket 连接属性
 */
export interface WsConnectionAttributes {
  id: string;
  userId: string;
  deviceId: string;
  socketId: string;
  nodeId: string;
  connectedAt: Date;
}

export type WsConnectionCreationAttributes = Optional<WsConnectionAttributes, "id" | "connectedAt">;

export class WsConnection extends Model<WsConnectionAttributes, WsConnectionCreationAttributes> implements WsConnectionAttributes {
  declare id: string;
  declare userId: string;
  declare deviceId: string;
  declare socketId: string;
  declare nodeId: string;
  declare connectedAt: Date;
}

export function initWsConnection(sequelize: Sequelize): typeof WsConnection {
  WsConnection.init(
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
      },
      deviceId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: "设备ID",
      },
      socketId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: "Socket ID",
      },
      nodeId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: "节点ID (集群)",
      },
      connectedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "连接时间",
      },
    },
    {
      sequelize,
      tableName: "ws_connections",
      updatedAt: false, // 只记录连接，断开通常直接删或移入历史表
      indexes: [
        { fields: ["userId"] },
        { fields: ["socketId"] },
        { fields: ["userId", "deviceId"] }, // 查询用户设备在线状态
        { fields: ["nodeId"] }, // 集群节点查询
        { fields: ["connectedAt"] }, // TTL 清理索引
      ],
    }
  );
  return WsConnection;
}
