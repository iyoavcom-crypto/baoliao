/**
 * @packageDocumentation
 * @module models/file/ref
 * @since 1.0.0
 * @author Z-kali
 * @description 文件引用表 (用于清理与权限)
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface FileRefAttributes {
  id: number;
  fileId: string;
  messageId: number | null; // 关联消息
  conversationId: number | null; // 关联会话 (便于群文件列表)
  userId: string | null; // 关联用户 (如头像)
  createdAt: Date;
}

export type FileRefCreationAttributes = Optional<FileRefAttributes, "id" | "messageId" | "conversationId" | "userId" | "createdAt">;

export class FileRef extends Model<FileRefAttributes, FileRefCreationAttributes> implements FileRefAttributes {
  declare id: number;
  declare fileId: string;
  declare messageId: number | null;
  declare conversationId: number | null;
  declare userId: string | null;
  declare createdAt: Date;
}

export function initFileRef(sequelize: Sequelize): typeof FileRef {
  FileRef.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      fileId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "files",
          key: "id"
        },
        onDelete: "CASCADE",
        comment: "文件ID"
      },
      messageId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      conversationId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      userId: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "file_refs",
      updatedAt: false,
      indexes: [
        { fields: ["fileId"] },
        { fields: ["messageId"] },
        { fields: ["conversationId"] },
        { fields: ["userId"] }, // 查询用户文件（头像、个人文件）
        { fields: ["conversationId", "createdAt"] }, // 群文件列表（时间排序）
        { fields: ["fileId", "messageId", "conversationId", "userId"], unique: true }, // 防重复引用
      ],
    }
  );
  return FileRef;
}
