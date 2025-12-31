/**
 * @packageDocumentation
 * @module models/file
 * @since 1.0.0
 * @author Z-kali
 * @description 文件元数据表
 */

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";

export interface FileAttributes {
  id: string; // UUID or Hash? UUID usually
  hash: string; // SHA256
  name: string;
  mime: string;
  size: number;
  key: string; // Storage key (S3/Local)
  uploaderId: string;
  createdAt: Date;
}

export type FileCreationAttributes = Optional<FileAttributes, "id" | "createdAt">;

export class FileModel extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  declare id: string;
  declare hash: string;
  declare name: string;
  declare mime: string;
  declare size: number;
  declare key: string;
  declare uploaderId: string;
  declare createdAt: Date;
}

export function initFile(sequelize: Sequelize): typeof FileModel {
  FileModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        comment: "文件Hash (SHA256) - 全局去重",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mime: {
        type: DataTypes.STRING(127),
        allowNull: false,
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "存储路径/Key",
      },
      uploaderId: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "files",
      updatedAt: false,
      indexes: [
        { fields: ["hash"], unique: true }, // 全局去重索引
        { fields: ["uploaderId"] },
      ],
    }
  );
  return FileModel;
}
