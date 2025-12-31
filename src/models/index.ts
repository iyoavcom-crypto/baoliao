/**
 * @packageDocumentation
 * @module models
 * @since 1.0.0
 * @author Z-kali
 * @description
 * Sequelize 模型统一初始化与注册入口。
 *
 * - 负责集中初始化所有 SQL Model
 * - 定义模型关联关系
 * - 提供通用 Model / ModelStatic 类型
 * - 提供 modelRegistry 用于通用 CRUD、动态路由、权限配置等场景
 * - 封装数据库同步流程（支持 schema patch）
 *
 * 文件位置：src/models/index.ts
 */

import { sequelize } from "../config";
import type { Model, ModelStatic } from "sequelize";


// =======================
// SQL Models Imports
// =======================

import { initRoleModel, Role } from "./admin/role";
import { associateRole } from "./admin/role/association";

import { initUser, User } from "./admin/user";
import { initUserDevice, UserDevice } from "./admin/user/device";
import { initUserSession, UserSession } from "./admin/user/session";
import { associateUser } from "./admin/user/association";
import { setupUserFriendHooks } from "./admin/user/friend-hook.js";

import { initGroup, Group } from "./group";
import { initGroupMember, GroupMember } from "./group/member";
import { initGroupJoinRequest, GroupJoinRequest } from "./group/join-request";
import { initGroupInvite, GroupInvite } from "./group/invite";
import { initGroupCapacity, GroupCapacity } from "./group/capacity";
import { initGroupEvent, GroupEvent } from "./group/event";
import { associateGroup } from "./group/association";
import { setupGroupHooks } from "./group/hook.js";
import { setupGroupMemberHooks } from "./group/member-hook.js";
import { setupGroupInviteHooks } from "./group/invite-hook.js";

import { initConversation, Conversation } from "./conversation/index";
import { associateConversation } from "./conversation/association";
import { setupConversationHooks } from "./conversation/hook.js";

import { initMessage, Message } from "./message/index";
import { initMessageDelivery, MessageDelivery } from "./message/delivery";
import { initMessageDedup, MessageDedup } from "./message/dedup";
import { initOfflineInbox, OfflineInbox } from "./message/offline";
import { initMessageEdit, MessageEdit } from "./message/edit";
import { initMessageRecall, MessageRecall } from "./message/recall";
import { initMessageRequest, MessageRequest } from "./message/request";
import { initMessageRead, MessageRead } from "./message/read";
import { initMessageAttachment, MessageAttachment } from "./message/attachment";
import { initMessageMention, MessageMention } from "./message/mention";
import { setupMessageHooks } from "./message/hook.js";
import { setupMessageReadHooks } from "./message/read-hook.js";

import { initUserFriend, UserFriend } from "./admin/user/friend";
import { initFriendRequestEvent, FriendRequestEvent } from "./admin/user/friend-request-event";
import { initConversationMember, ConversationMember } from "./conversation/member";
import { initMessageReaction, MessageReaction } from "./message/reaction";
import { initWsConnection, WsConnection } from "./ws/connection";

import { initFile, FileModel } from "./file";
import { initFileRef, FileRef } from "./file/ref";
import { initFileToken, FileToken } from "./file/token";
import { setupFileHooks } from "./file/hook.js";
import { setupFileRefHooks } from "./file/ref-hook.js";

import { initFeatureDefinition, FeatureDefinition } from "./system/feature/definition";
import { initFeaturePolicy, FeaturePolicy } from "./system/feature/policy";
import { initFeatureAuditLog, FeatureAuditLog } from "./system/feature/audit";
import { setupFeaturePolicyHooks } from "./system/feature/policy-hook.js";

import { initReport, Report } from "./admin/safety/report";
import { initPenalty, Penalty } from "./admin/safety/penalty";
import { initRateLimitLog, RateLimitLog } from "./admin/safety/rate-limit-log";
import { initIpBlock, IpBlock } from "./admin/safety/ip-block";
import { setupPenaltyHooks } from "./admin/safety/penalty-hook.js";
import { setupIpBlockHooks } from "./admin/safety/ip-block-hook.js";

import { associateMessage } from "./message/association";
import { associateFile } from "./file/association";
import { associateSystem } from "./system/association";

import { initApiConfig, ApiConfig } from "./api";
import { associateApiConfig } from "./api/association";
import { setupApiConfigHooks } from "./api/hook.js";
  
// =======================
// Model Initialization
// =======================

/**
 * @description
 * 初始化所有 Sequelize Model（仅定义字段与表结构，不涉及关联）
 * ⚠️ 顺序需保证所有 Model 在建立关联前已注册到 sequelize
 */
initRoleModel(sequelize);
initUser(sequelize);
initUserDevice(sequelize);
initUserSession(sequelize);
initGroup(sequelize);
initGroupMember(sequelize);
initGroupJoinRequest(sequelize);
initGroupInvite(sequelize);
initGroupCapacity(sequelize);
initGroupEvent(sequelize);
initConversation(sequelize);
initMessage(sequelize);
initMessageDelivery(sequelize);
initMessageDedup(sequelize);
initOfflineInbox(sequelize);
initMessageEdit(sequelize);
initMessageRecall(sequelize);
initMessageRequest(sequelize);
initMessageRead(sequelize);
initMessageAttachment(sequelize);
initMessageMention(sequelize);
initUserFriend(sequelize);
initFriendRequestEvent(sequelize);
initConversationMember(sequelize);
initMessageReaction(sequelize);
initWsConnection(sequelize);
initFile(sequelize);
initFileRef(sequelize);
initFileToken(sequelize);
initFeatureDefinition(sequelize);
initFeaturePolicy(sequelize);
initFeatureAuditLog(sequelize);
initReport(sequelize);
initPenalty(sequelize);
initRateLimitLog(sequelize);
initIpBlock(sequelize);
initApiConfig(sequelize);

// =======================
// Model Hooks Setup
// =======================

/**
 * @description
 * 设置所有模型的钩子函数
 * - 必须在所有 Model init 之后、关联之前执行
 * - 顺序：核心模型优先（User, Message, Group, Conversation）
 * - P0/P1 Hook：业务核心逻辑
 * - P2 Hook：辅助功能（去重、过期清理、引用计数、审计）
 */
// P0/P1 核心 Hooks
setupMessageHooks(Message);
setupGroupHooks(Group);
setupGroupMemberHooks(GroupMember);
setupConversationHooks(Conversation);
setupFileHooks(FileModel);
setupUserFriendHooks(UserFriend);
setupPenaltyHooks(Penalty);

// P2 辅助 Hooks
setupMessageReadHooks(MessageRead);
setupGroupInviteHooks(GroupInvite);
setupFileRefHooks(FileRef);
setupIpBlockHooks(IpBlock);
setupFeaturePolicyHooks(FeaturePolicy);
setupApiConfigHooks(ApiConfig);
 

// =======================
// Model Associations
// =======================

/**
 * @description
 * 定义模型之间的关联关系
 * - hasMany / belongsTo / belongsToMany 等
 * - 必须在所有 Model init 之后执行
 */
associateRole();
associateUser();
associateGroup();
associateConversation();
associateMessage();
associateFile();
associateSystem();
associateApiConfig();
 
  

// =======================
// Common Types
// =======================

/**
 * @type AnyModel
 * @description
 * 通用 Sequelize Model 实例类型（instance）
 * 用于泛型 CRUD、Hook、权限拦截等场景
 */
export type AnyModel = Model<any, any>;

/**
 * @type AnyModelStatic
 * @description
 * 通用 Sequelize Model 静态类型（class）
 * 用于动态获取模型、通用 Service、Registry 映射
 */
export type AnyModelStatic = ModelStatic<AnyModel>;

/**
 * @constant modelRegistry
 * @description 模型注册表,用于动态获取模型
 */
export const modelRegistry: Record<string, AnyModelStatic> = {
  Role,
  User,
  UserDevice,
  UserSession,
  UserFriend,
  FriendRequestEvent,
  Group,
  GroupMember,
  GroupJoinRequest,
  GroupInvite,
  GroupCapacity,
  GroupEvent,
  Conversation,
  ConversationMember,
  Message,
  MessageDelivery,
  MessageDedup,
  OfflineInbox,
  MessageEdit,
  MessageRecall,
  MessageRequest,
  MessageRead,
  MessageReaction,
  MessageAttachment,
  MessageMention,
  WsConnection,
  File: FileModel,
  FileRef,
  FileToken,
  FeatureDefinition,
  FeaturePolicy,
  FeatureAuditLog,
  Report,
  Penalty,
  RateLimitLog,
  IpBlock,
  ApiConfig,
};

/**
 * @function syncModels
 * @description 同步数据库结构
 */
export async function syncModels() {
  // 开发环境使用 alter: true，生产环境建议使用 migration
  // 暂时关闭自动同步，依赖 initDatabase 的同步
  // await sequelize.sync({ alter: true });
}

export {
  Role,
  User, UserDevice, UserSession, UserFriend, FriendRequestEvent,
  Group, GroupMember, GroupJoinRequest, GroupInvite, GroupCapacity, GroupEvent,
  Conversation, ConversationMember,
  Message, MessageDelivery, MessageDedup, OfflineInbox, MessageEdit, MessageRecall, MessageRequest, MessageRead, MessageReaction, MessageAttachment, MessageMention,
  WsConnection,
  FileModel, FileRef, FileToken,
  FeatureDefinition, FeaturePolicy, FeatureAuditLog,
  Report, Penalty, RateLimitLog, IpBlock,
  ApiConfig
};
