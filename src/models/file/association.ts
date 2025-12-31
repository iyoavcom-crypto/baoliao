/**
 * @packageDocumentation
 * @module models/file/association
 * @description File 模型关联定义
 */

import { FileModel } from "./index";
import { FileRef } from "./ref";
import { FileToken } from "./token";
import { User } from "../admin/user";
import { Message } from "../message/index";
import { Conversation } from "../conversation/index";

/**
 * @function associateFile
 * @description 建立 File 与其他模型的关联
 */
export function associateFile() {
  // File -> User (Uploader)
  FileModel.belongsTo(User, {
    as: "uploader",
    foreignKey: "uploaderId",
    constraints: false,
  });

  // File -> FileRef
  FileModel.hasMany(FileRef, {
    as: "refs",
    foreignKey: "fileId",
    constraints: false,
  });
  FileRef.belongsTo(FileModel, {
    as: "file",
    foreignKey: "fileId",
    constraints: false,
  });

  // File -> FileToken
  FileModel.hasMany(FileToken, {
    as: "tokens",
    foreignKey: "fileId",
    constraints: false,
  });
  FileToken.belongsTo(FileModel, {
    as: "file",
    foreignKey: "fileId",
    constraints: false,
  });
  
  // FileRef -> Message (如果引用的是消息附件)
  FileRef.belongsTo(Message, {
    as: "message",
    foreignKey: "messageId",
    constraints: false,
  });
  
  // FileRef -> User (如果是用户头像/个人文件)
  FileRef.belongsTo(User, {
    as: "owner",
    foreignKey: "userId",
    constraints: false,
  });
  
  // FileRef -> Conversation (如果是群文件)
  FileRef.belongsTo(Conversation, {
    as: "conversation",
    foreignKey: "conversationId",
    constraints: false,
  });
}
