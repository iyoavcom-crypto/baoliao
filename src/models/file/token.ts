/**
 * @packageDocumentation
 * @module models/file/token
 * @since 1.0.0
 * @author Z-kali
 * @description 文件临时访问 Token
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface FileTokenAttributes {
  id: number;
  fileId: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export type FileTokenCreationAttributes = Optional<FileTokenAttributes, "id" | "createdAt">;

export class FileToken extends Model<FileTokenAttributes, FileTokenCreationAttributes> implements FileTokenAttributes {
  declare id: number;
  declare fileId: string;
  declare userId: string;
  declare token: string;
  declare expiresAt: Date;
  declare createdAt: Date;
}

export function initFileToken(sequelize: Sequelize): typeof FileToken {
  FileToken.init(
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
      userId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "file_tokens",
      updatedAt: false,
      indexes: [
        { fields: ["token"], unique: true },
        { fields: ["expiresAt"] }, // Cleanup
      ],
    }
  );
  return FileToken;
}
