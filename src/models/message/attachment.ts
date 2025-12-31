/**
 * @packageDocumentation
 * @module models/message/attachment
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息附件表（从 JSON 字段拆分出来，支持按类型索引查询）
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

/**
 * @interface MessageAttachmentAttributes
 * @description 消息附件表字段定义
 */
export interface MessageAttachmentAttributes {
  id: number;
  messageId: number; // Message.id
  type: string; // MIME类型: image/jpeg, application/pdf 等
  url: string; // 文件URL
  name: string | null; // 文件名
  size: number | null; // 文件大小（字节）
  width: number | null; // 图片宽度
  height: number | null; // 图片高度
  duration: number | null; // 音视频时长（秒）
  createdAt: Date;
}

export type MessageAttachmentCreationAttributes = Optional<
  MessageAttachmentAttributes,
  "id" | "name" | "size" | "width" | "height" | "duration" | "createdAt"
>;

export class MessageAttachment
  extends Model<MessageAttachmentAttributes, MessageAttachmentCreationAttributes>
  implements MessageAttachmentAttributes
{
  declare id: number;
  declare messageId: number;
  declare type: string;
  declare url: string;
  declare name: string | null;
  declare size: number | null;
  declare width: number | null;
  declare height: number | null;
  declare duration: number | null;
  declare createdAt: Date;
}

export function initMessageAttachment(sequelize: Sequelize): typeof MessageAttachment {
  MessageAttachment.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: "主键ID",
      },
      messageId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "消息ID",
        references: {
          model: "messages",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "MIME类型 (image/jpeg, video/mp4 等)",
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: "文件URL",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "文件名",
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "文件大小（字节）",
      },
      width: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "图片宽度",
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "图片高度",
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "音视频时长（秒）",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "创建时间",
      },
    },
    {
      sequelize,
      tableName: "message_attachments",
      updatedAt: false,
      comment: "消息附件表（支持按类型筛选）",
      indexes: [
        { fields: ["messageId"] }, // 查询消息的所有附件
        { fields: ["type"] }, // 按文件类型筛选
        { fields: ["type", "createdAt"] }, // 按类型+时间查询（如：最近的图片）
      ],
    }
  );
  return MessageAttachment;
}
