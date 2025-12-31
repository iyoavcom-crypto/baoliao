/**
 * @packageDocumentation
 * @module types/ws/events
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 事件数据类型定义
 */

// ==================== 认证模块 ====================

/**
 * @interface AuthHelloReqData
 * @description 握手请求数据
 */
export interface AuthHelloReqData {
  /** JWT Token */
  token: string;
  /** 设备ID */
  deviceId: string;
  /** 客户端版本（可选） */
  clientVersion?: string;
  /** 平台信息（可选） */
  platform?: string;
}

/**
 * @interface AuthHelloAckData
 * @description 握手响应数据
 */
export interface AuthHelloAckData {
  /** 用户ID */
  userId: string;
  /** 连接ID */
  connId: string;
  /** 服务器时间戳 */
  serverTime: number;
  /** 服务器能力列表（可选） */
  capabilities?: string[];
}

// ==================== 系统模块 ====================

/**
 * @interface SystemPingReqData
 * @description 心跳请求数据
 */
export interface SystemPingReqData {
  /** 客户端时间戳 */
  timestamp: number;
}

/**
 * @interface SystemPongAckData
 * @description 心跳响应数据
 */
export interface SystemPongAckData {
  /** 服务器时间戳 */
  serverTime: number;
}

// ==================== 消息模块 ====================

/**
 * @interface MessageSendReqData
 * @description 发送消息请求数据
 */
export interface MessageSendReqData {
  /** 会话ID */
  conversationId: number;
  /** 消息内容 */
  content: string;
  /** 消息类型 */
  type?: string;
  /** 客户端消息ID（去重用） */
  clientMsgId?: string;
  /** @提及的用户ID列表 */
  mentions?: string[];
}

/**
 * @interface MessageSendAckData
 * @description 发送消息响应数据
 */
export interface MessageSendAckData {
  /** 服务器消息ID */
  msgId: string;
  /** 消息序号 */
  seq: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface MessagePushData
 * @description 消息推送数据
 */
export interface MessagePushData {
  /** 消息ID */
  msgId: string;
  /** 会话ID */
  conversationId: number;
  /** 发送者ID */
  senderId: string;
  /** 消息内容 */
  content: string;
  /** 消息类型 */
  type: string;
  /** 消息序号 */
  seq: number;
  /** 时间戳 */
  timestamp: number;
  /** @提及的用户ID列表 */
  mentions?: string[];
}

/**
 * @interface MessageRecallReqData
 * @description 撤回消息请求数据
 */
export interface MessageRecallReqData {
  /** 消息ID */
  msgId: string;
}

/**
 * @interface MessageRecalledPushData
 * @description 消息撤回推送数据
 */
export interface MessageRecalledPushData {
  /** 消息ID */
  msgId: string;
  /** 会话ID */
  conversationId: number;
  /** 撤回时间 */
  recalledAt: number;
}

/**
 * @interface MessageReadReqData
 * @description 标记已读请求数据
 */
export interface MessageReadReqData {
  /** 会话ID */
  conversationId: number;
  /** 已读到的最大序号 */
  seq: number;
}

/**
 * @interface MessageReadAckData
 * @description 标记已读响应数据
 */
export interface MessageReadAckData {
  /** 会话ID */
  conversationId: number;
  /** 已读序号 */
  seq: number;
  /** 更新时间 */
  timestamp: number;
}

/**
 * @interface MessageReadPushData
 * @description 已读回执推送数据
 */
export interface MessageReadPushData {
  /** 会话ID */
  conversationId: number;
  /** 用户ID */
  userId: string;
  /** 已读序号 */
  seq: number;
  /** 更新时间 */
  timestamp: number;
}

/**
 * @interface MessageEditReqData
 * @description 消息编辑请求数据
 */
export interface MessageEditReqData {
  /** 消息ID */
  messageId: number;
  /** 新内容 */
  content: string;
}

/**
 * @interface MessageEditAckData
 * @description 消息编辑响应数据
 */
export interface MessageEditAckData {
  /** 消息ID */
  messageId: number;
  /** 编辑时间 */
  editedAt: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface MessageEditedPushData
 * @description 消息编辑推送数据
 */
export interface MessageEditedPushData {
  /** 消息ID */
  messageId: number;
  /** 会话iD */
  conversationId: number;
  /** 新内容 */
  content: string;
  /** 编辑时间 */
  editedAt: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface MessageHistoryPullReqData
 * @description 历史消息拉取请求数据
 */
export interface MessageHistoryPullReqData {
  /** 会话iD */
  conversationId: number;
  /** 起始序号（从这个序号往前拉取） */
  startSeq?: number;
  /** 每页数量 */
  limit?: number;
}

/**
 * @interface MessageHistoryPullAckData
 * @description 历史消息拉取响应数据
 */
export interface MessageHistoryPullAckData {
  /** 会话iD */
  conversationId: number;
  /** 消息列表 */
  messages: any[];
  /** 是否还有更多 */
  hasMore: boolean;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface MessageReactSetReqData
 * @description 消息表情反应请求数据
 */
export interface MessageReactSetReqData {
  /** 消息ID */
  messageId: number;
  /** 表情类型 */
  reactionType: string;
  /** 操作类型：add=添加，remove=移除 */
  action: 'add' | 'remove';
}

/**
 * @interface MessageReactSetAckData
 * @description 消息表情反应响应数据
 */
export interface MessageReactSetAckData {
  /** 消息ID */
  messageId: number;
  /** 表情类型 */
  reactionType: string;
  /** 操作类型 */
  action: 'add' | 'remove';
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface MessageReactPushData
 * @description 消息表情反应推送数据
 */
export interface MessageReactPushData {
  /** 消息ID */
  messageId: number;
  /** 会话ID */
  conversationId: number;
  /** 用户ID */
  userId: string;
  /** 表情类型 */
  reactionType: string;
  /** 操作类型 */
  action: 'add' | 'remove';
  /** 当前表情统计 */
  reactionCount?: Record<string, number>;
  /** 时间戳 */
  timestamp: number;
}

// ==================== 会话模块 ====================

/**
 * @interface ConversationCreateReqData
 * @description 创建会话请求数据
 */
export interface ConversationCreateReqData {
  /** 目标用户ID（单聊） */
  targetId?: string;
  /** 成员ID列表（群聊） */
  memberIds?: string[];
  /** 会话类型 */
  type: "private" | "group";
}

/**
 * @interface ConversationCreateAckData
 * @description 创建会话响应数据
 */
export interface ConversationCreateAckData {
  /** 会话ID */
  conversationId: string;
}

/**
 * @interface ConversationBadgePushData
 * @description 会话未读数推送数据
 */
export interface ConversationBadgePushData {
  /** 会话ID */
  conversationId: string;
  /** 未读数 */
  unreadCount: number;
}

/**
 * @interface ConversationTypingReqData
 * @description 输入状态请求数据
 */
export interface ConversationTypingReqData {
  /** 会话ID */
  conversationId: number;
  /** 输入状态：true=正在输入，false=停止输入 */
  typing: boolean;
}

/**
 * @interface ConversationTypingPushData
 * @description 输入状态推送数据
 */
export interface ConversationTypingPushData {
  /** 会话ID */
  conversationId: number;
  /** 用户ID */
  userId: string;
  /** 输入状态 */
  typing: boolean;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface ConversationCreateReqData
 * @description 创建会话请求数据
 */
export interface ConversationCreateReqData {
  /** 对方用户ID（私聊） */
  targetUserId?: string;
  /** 群组ID（群聊） */
  groupId?: string;
}

/**
 * @interface ConversationCreateAckData
 * @description 创建会话响应数据
 */
export interface ConversationCreateAckData {
  /** 会话iD */
  conversationId: number;
  /** 会话类型 */
  type: 'private' | 'group';
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface ConversationListReqData
 * @description 会话列表请求数据
 */
export interface ConversationListReqData {
  /** 页码（可选） */
  page?: number;
  /** 每页数量（可选） */
  limit?: number;
}

/**
 * @interface ConversationListAckData
 * @description 会话列表响应数据
 */
export interface ConversationListAckData {
  /** 会话列表 */
  conversations: {
    conversationId: number;
    type: 'private' | 'group';
    targetId?: string;
    groupId?: number;
    lastMessage?: {
      msgId: string;
      content: string;
      senderId: string;
      timestamp: number;
    };
    unreadCount: number;
    lastReadMessageId: number;
    updatedAt: number;
  }[];
  /** 总数 */
  total: number;
  /** 时间戳 */
  timestamp: number;
}

// ==================== 好友模块 ====================

/**
 * @interface FriendApplyReqData
 * @description 好友申请请求数据
 */
export interface FriendApplyReqData {
  /** 目标用户ID */
  friendId: string;
  /** 申请消息 */
  message?: string;
  /** 来源 */
  source?: string;
}

/**
 * @interface FriendApplyAckData
 * @description 好友申请响应数据
 */
export interface FriendApplyAckData {
  /** 申请ID */
  requestId: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface FriendApplyPushData
 * @description 好友申请推送数据
 */
export interface FriendApplyPushData {
  /** 申请ID */
  requestId: number;
  /** 申请人ID */
  fromId: string;
  /** 申请消息 */
  message?: string;
  /** 申请时间 */
  timestamp: number;
}

/**
 * @interface FriendAcceptReqData
 * @description 接受好友请求数据
 */
export interface FriendAcceptReqData {
  /** 申请ID */
  requestId: number;
}

/**
 * @interface FriendAcceptAckData
 * @description 接受好友响应数据
 */
export interface FriendAcceptAckData {
  /** 好友ID */
  friendId: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface FriendRejectReqData
 * @description 拒绝好友请求数据
 */
export interface FriendRejectReqData {
  /** 申请ID */
  requestId: number;
  /** 拒绝原因 */
  reason?: string;
}

/**
 * @interface FriendDeleteReqData
 * @description 删除好友请求数据
 */
export interface FriendDeleteReqData {
  /** 好友ID */
  friendId: string;
}

/**
 * @interface FriendDeleteAckData
 * @description 删除好友响应数据
 */
export interface FriendDeleteAckData {
  /** 好友ID */
  friendId: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface FriendBlockReqData
 * @description 拉黑好友请求数据
 */
export interface FriendBlockReqData {
  /** 好友ID */
  friendId: string;
  /** 拉黑原因 */
  reason?: string;
}

/**
 * @interface FriendBlockAckData
 * @description 拉黑好友响应数据
 */
export interface FriendBlockAckData {
  /** 好友ID */
  friendId: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface FriendListReqData
 * @description 好友列表请求数据
 */
export interface FriendListReqData {
  /** 页码（可选） */
  page?: number;
  /** 每页数量（可选） */
  limit?: number;
  /** 状态筛选（可选） */
  status?: string;
}

/**
 * @interface FriendListAckData
 * @description 好友列表响应数据
 */
export interface FriendListAckData {
  /** 好友列表 */
  friends: {
    friendId: string;
    username?: string;
    nickname?: string;
    avatar?: string;
    status: string;
    remark?: string;
    createdAt: number;
  }[];
  /** 总数 */
  total: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface FriendSearchReqData
 * @description 好友搜索请求数据
 */
export interface FriendSearchReqData {
  /** 搜索关键词 */
  keyword: string;
  /** 搜索类型：username/nickname/phone */
  type?: 'username' | 'nickname' | 'phone';
  /** 页码（可选） */
  page?: number;
  /** 每页数量（可选） */
  limit?: number;
}

/**
 * @interface FriendSearchAckData
 * @description 好友搜索响应数据
 */
export interface FriendSearchAckData {
  /** 搜索结果 */
  users: {
    userId: string;
    username?: string;
    nickname?: string;
    avatar?: string;
    phone?: string;
    status: 'not_friend' | 'pending' | 'accepted' | 'blocked';
    friendId?: string;
    remark?: string;
    createdAt?: number;
  }[];
  /** 总数 */
  total: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface FriendUnblockReqData
 * @description 取消拉黑好友请求数据
 */
export interface FriendUnblockReqData {
  /** 好友ID */
  friendId: string;
}

/**
 * @interface FriendUnblockAckData
 * @description 取消拉黑好友响应数据
 */
export interface FriendUnblockAckData {
  /** 好友ID */
  friendId: string;
  /** 时间戳 */
  timestamp: number;
}

// ==================== 群组模块 ====================

/**
 * @interface GroupCreateReqData
 * @description 创建群组请求数据
 */
export interface GroupCreateReqData {
  /** 群名称 */
  name: string;
  /** 成员ID列表 */
  memberIds: string[];
  /** 群头像 */
  avatar?: string;
}

/**
 * @interface GroupCreateAckData
 * @description 创建群组响应数据
 */
export interface GroupCreateAckData {
  /** 群组ID */
  groupId: string;
  /** 会话iD */
  conversationId: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface GroupInviteReqData
 * @description 邀请入群请求数据
 */
export interface GroupInviteReqData {
  /** 群组ID */
  groupId: string;
  /** 被邀请用户ID列表 */
  memberIds: string[];
}

/**
 * @interface GroupInviteAckData
 * @description 邀请入群响应数据
 */
export interface GroupInviteAckData {
  /** 成功数量 */
  successCount: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface GroupJoinReqData
 * @description 加入群组请求数据
 */
export interface GroupJoinReqData {
  /** 群组ID */
  groupId: string;
  /** 验证信息（如需要） */
  verifyMessage?: string;
}

/**
 * @interface GroupJoinAckData
 * @description 加入群组响应数据
 */
export interface GroupJoinAckData {
  /** 群组ID */
  groupId: string;
  /** 会话ID */
  conversationId: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface GroupLeaveReqData
 * @description 退出群组请求数据
 */
export interface GroupLeaveReqData {
  /** 群组ID */
  groupId: string;
}

/**
 * @interface GroupLeaveAckData
 * @description 退出群组响应数据
 */
export interface GroupLeaveAckData {
  /** 群组ID */
  groupId: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface GroupKickReqData
 * @description 踢出成员请求数据
 */
export interface GroupKickReqData {
  /** 群组ID */
  groupId: string;
  /** 被踢出用户ID */
  userId: string;
  /** 原因 */
  reason?: string;
}

/**
 * @interface GroupKickAckData
 * @description 踢出成员响应数据
 */
export interface GroupKickAckData {
  /** 群组ID */
  groupId: string;
  /** 被踢出用户ID */
  userId: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface GroupMemberJoinedPushData
 * @description 成员加入推送数据
 */
export interface GroupMemberJoinedPushData {
  /** 群组ID */
  groupId: string;
  /** 加入的用户ID列表 */
  userIds: string[];
  /** 邀请人ID */
  inviterId?: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * @interface GroupMemberLeftPushData
 * @description 成员离开推送数据
 */
export interface GroupMemberLeftPushData {
  /** 群组ID */
  groupId: string;
  /** 离开的用户ID */
  userId: string;
  /** 离开类型：leave=主动退出，kick=被踢出 */
  type: 'leave' | 'kick';
  /** 操作人ID（踢人时） */
  operatorId?: string;
  /** 时间戳 */
  timestamp: number;
}

// ==================== 回执模块 ====================

/**
 * @interface ReceiptReadReqData
 * @description 已读回执请求数据
 */
export interface ReceiptReadReqData {
  /** 会话ID */
  conversationId: string;
  /** 已读序号 */
  readSeq: number;
}

/**
 * @interface ReceiptReadPushData
 * @description 已读回执推送数据
 */
export interface ReceiptReadPushData {
  /** 会话ID */
  conversationId: string;
  /** 用户ID */
  userId: string;
  /** 已读序号 */
  readSeq: number;
  /** 时间戳 */
  timestamp: number;
}
