/**
 * @packageDocumentation
 * @module models/conversation/association
 * @description Conversation 模型关联定义
 */

import { Conversation } from "./index";
import { ConversationMember } from "./member";
import { Group } from "../group";
import { User } from "../admin/user";

/**
 * @function associateConversation
 * @description 建立 Conversation 与其他模型的关联
 */
export function associateConversation() {
  // Conversation 属于 Group
  Conversation.belongsTo(Group, {
    as: "group",
    foreignKey: "groupId",
    constraints: false,
  });

  // 会话发送方（平台或群主）
  Conversation.belongsTo(User, {
    as: "sender",
    foreignKey: "senderId",
    constraints: false,
  });
  
  // Direct Chat Users
  Conversation.belongsTo(User, {
    as: "userA",
    foreignKey: "directUserA",
    constraints: false,
  });
  Conversation.belongsTo(User, {
    as: "userB",
    foreignKey: "directUserB",
    constraints: false,
  });

  // Group 拥有一个 Conversation (反向关联)
  Group.hasOne(Conversation, {
    as: "conversation",
    foreignKey: "groupId",
    constraints: false,
  });
  
  // Conversation -> ConversationMember
  Conversation.hasMany(ConversationMember, {
    as: "members",
    foreignKey: "conversationId",
    constraints: false,
  });
  ConversationMember.belongsTo(Conversation, {
    as: "conversation",
    foreignKey: "conversationId",
    constraints: false,
  });

  // ConversationMember -> User
  ConversationMember.belongsTo(User, {
    as: "user",
    foreignKey: "userId",
    constraints: false,
  });
  
}