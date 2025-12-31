/**
 * @packageDocumentation
 * @module models/message/association
 * @description Message 模型关联定义
 */

import { Message } from "./index";
import { MessageDelivery } from "./delivery";
import { MessageDedup } from "./dedup";
import { OfflineInbox } from "./offline";
import { MessageEdit } from "./edit";
import { MessageRecall } from "./recall";
import { MessageRead } from "./read";
import { MessageReaction } from "./reaction";
import { MessageAttachment } from "./attachment";
import { MessageMention } from "./mention";
import { User } from "../admin/user";
import { Conversation } from "../conversation/index";

/**
 * @function associateMessage
 * @description 建立 Message 与其他模型的关联
 */
export function associateMessage() {
  // Message -> User (Sender)
  Message.belongsTo(User, {
    as: "sender",
    foreignKey: "senderId",
    constraints: false,
  });

  // Message -> Conversation
  Message.belongsTo(Conversation, {
    as: "conversation",
    foreignKey: "conversationId",
    constraints: false,
  });

  // Message -> MessageDelivery
  Message.hasMany(MessageDelivery, {
    as: "deliveries",
    foreignKey: "messageId",
    constraints: false,
  });
  MessageDelivery.belongsTo(Message, {
    as: "message",
    foreignKey: "messageId",
    constraints: false,
  });

  // Message -> MessageEdit
  Message.hasMany(MessageEdit, {
    as: "edits",
    foreignKey: "messageId",
    constraints: false,
  });
  MessageEdit.belongsTo(Message, {
    as: "message",
    foreignKey: "messageId",
    constraints: false,
  });

  // Message -> MessageRecall
  Message.hasOne(MessageRecall, {
    as: "recallRecord",
    foreignKey: "messageId",
    constraints: false,
  });
  MessageRecall.belongsTo(Message, {
    as: "message",
    foreignKey: "messageId",
    constraints: false,
  });

  // Message -> OfflineInbox
  Message.hasMany(OfflineInbox, {
    as: "offlineRecipients",
    foreignKey: "messageId",
    constraints: false,
  });
  OfflineInbox.belongsTo(Message, {
    as: "message",
    foreignKey: "messageId",
    constraints: false,
  });

  // Message -> MessageRead
  Message.hasMany(MessageRead, {
    as: "readReceipts",
    foreignKey: "messageId",
    constraints: false,
  });
  MessageRead.belongsTo(Message, {
    as: "message",
    foreignKey: "messageId",
    constraints: false,
  });

  // Message -> MessageReaction
  Message.hasMany(MessageReaction, {
    as: "reactions",
    foreignKey: "messageId",
    constraints: false,
  });
  MessageReaction.belongsTo(Message, {
    as: "message",
    foreignKey: "messageId",
    constraints: false,
  });

  // Message -> MessageDedup
  Message.hasOne(MessageDedup, {
    as: "dedupRecord",
    foreignKey: "messageId",
    constraints: false,
  });
  MessageDedup.belongsTo(Message, {
    as: "message",
    foreignKey: "messageId",
    constraints: false,
  });

  // OfflineInbox -> User
  OfflineInbox.belongsTo(User, {
    as: "recipient",
    foreignKey: "userId",
    constraints: false,
  });
  
  // MessageDelivery -> User
  MessageDelivery.belongsTo(User, {
    as: "recipient",
    foreignKey: "toUserId",
    constraints: false,
  });
  
  // MessageReaction -> User
  MessageReaction.belongsTo(User, {
    as: "user",
    foreignKey: "userId",
    constraints: false,
  });
  
  // MessageRead -> User
  MessageRead.belongsTo(User, {
    as: "user",
    foreignKey: "userId",
    constraints: false,
  });
  
  // MessageRead -> Conversation
  MessageRead.belongsTo(Conversation, {
    as: "conversation",
    foreignKey: "conversationId",
    constraints: false,
  });

  // Message -> MessageAttachment
  Message.hasMany(MessageAttachment, {
    as: "attachmentRecords",
    foreignKey: "messageId",
    constraints: false,
  });
  MessageAttachment.belongsTo(Message, {
    as: "message",
    foreignKey: "messageId",
    constraints: false,
  });

  // Message -> MessageMention
  Message.hasMany(MessageMention, {
    as: "mentions",
    foreignKey: "messageId",
    constraints: false,
  });
  MessageMention.belongsTo(Message, {
    as: "message",
    foreignKey: "messageId",
    constraints: false,
  });

  // MessageMention -> User
  MessageMention.belongsTo(User, {
    as: "mentionedUser",
    foreignKey: "userId",
    constraints: false,
  });

  // MessageMention -> Conversation
  MessageMention.belongsTo(Conversation, {
    as: "conversation",
    foreignKey: "conversationId",
    constraints: false,
  });
}
