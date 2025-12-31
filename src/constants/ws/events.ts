/**
 * @packageDocumentation
 * @module constants/ws/events
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 事件名称常量
 */

// ==================== 认证模块 ====================
export const AUTH_HELLO_REQ = "auth.hello.req";
export const AUTH_HELLO_ACK = "auth.hello.ack";

// ==================== 系统模块 ====================
export const SYSTEM_PING_REQ = "system.ping.req";
export const SYSTEM_PONG_ACK = "system.pong.ack";

// ==================== 消息模块 ====================
export const MESSAGE_SEND_REQ = "message.send.req";
export const MESSAGE_SEND_ACK = "message.send.ack";
export const MESSAGE_PUSH = "message.push";
export const MESSAGE_TYPING_PUSH = "message.typing.push";

export const MESSAGE_HISTORY_PULL_REQ = "message.history.pull.req";
export const MESSAGE_HISTORY_PULL_ACK = "message.history.pull.ack";

export const MESSAGE_REACT_SET_REQ = "message.react.set.req";
export const MESSAGE_REACT_SET_ACK = "message.react.set.ack";
export const MESSAGE_REACT_PUSH = "message.react.push";

export const MESSAGE_EDIT_REQ = "message.edit.req";
export const MESSAGE_EDIT_ACK = "message.edit.ack";
export const MESSAGE_EDITED_PUSH = "message.edited.push";

export const MESSAGE_RECALL_REQ = "message.recall.req";
export const MESSAGE_RECALL_ACK = "message.recall.ack";
export const MESSAGE_RECALLED_PUSH = "message.recalled.push";

export const MESSAGE_READ_REQ = "message.read.req";
export const MESSAGE_READ_ACK = "message.read.ack";
export const MESSAGE_READ_PUSH = "message.read.push";

// ==================== 会话模块 ====================
export const CONVERSATION_CREATE_REQ = "conversation.create.req";
export const CONVERSATION_CREATE_ACK = "conversation.create.ack";
export const CONVERSATION_BADGE_PUSH = "conversation.badge.push";

export const CONVERSATION_LIST_REQ = "conversation.list.req";
export const CONVERSATION_LIST_ACK = "conversation.list.ack";

export const CONVERSATION_TYPING_REQ = "conversation.typing.req";
export const CONVERSATION_TYPING_PUSH = "conversation.typing.push";

// ==================== 好友模块 ====================
export const FRIEND_APPLY_REQ = "friend.apply.req";
export const FRIEND_APPLY_ACK = "friend.apply.ack";
export const FRIEND_APPLY_PUSH = "friend.apply.push";

export const FRIEND_ACCEPT_REQ = "friend.accept.req";
export const FRIEND_ACCEPT_ACK = "friend.accept.ack";

export const FRIEND_REJECT_REQ = "friend.reject.req";
export const FRIEND_REJECT_ACK = "friend.reject.ack";

export const FRIEND_DELETE_REQ = "friend.delete.req";
export const FRIEND_DELETE_ACK = "friend.delete.ack";

export const FRIEND_BLOCK_REQ = "friend.block.req";
export const FRIEND_BLOCK_ACK = "friend.block.ack";

export const FRIEND_UNBLOCK_REQ = "friend.unblock.req";
export const FRIEND_UNBLOCK_ACK = "friend.unblock.ack";

export const FRIEND_LIST_REQ = "friend.list.req";
export const FRIEND_LIST_ACK = "friend.list.ack";

export const FRIEND_SEARCH_REQ = "friend.search.req";
export const FRIEND_SEARCH_ACK = "friend.search.ack";

// ==================== 群组模块 ====================
export const GROUP_CREATE_REQ = "group.create.req";
export const GROUP_CREATE_ACK = "group.create.ack";

export const GROUP_INVITE_REQ = "group.invite.req";
export const GROUP_INVITE_ACK = "group.invite.ack";

export const GROUP_JOIN_REQ = "group.join.req";
export const GROUP_JOIN_ACK = "group.join.ack";

export const GROUP_LEAVE_REQ = "group.leave.req";
export const GROUP_LEAVE_ACK = "group.leave.ack";

export const GROUP_KICK_REQ = "group.kick.req";
export const GROUP_KICK_ACK = "group.kick.ack";

export const GROUP_MEMBER_JOINED_PUSH = "group.member.joined.push";
export const GROUP_MEMBER_LEFT_PUSH = "group.member.left.push";

export const GROUP_QUIT_REQ = "group.quit.req";
export const GROUP_QUIT_ACK = "group.quit.ack";

export const GROUP_DISSOLVE_REQ = "group.dissolve.req";
export const GROUP_DISSOLVE_ACK = "group.dissolve.ack";

// ==================== 在线状态模块 ====================
export const PRESENCE_PUSH = "presence.push";

// ==================== 离线消息模块 ====================
export const OFFLINE_MESSAGES_PUSH = "offline.messages.push";

// ==================== 回执模块 ====================
export const RECEIPT_READ_REQ = "receipt.read.req";
export const RECEIPT_READ_ACK = "receipt.read.ack";
export const RECEIPT_READ_PUSH = "receipt.read.push";

export const RECEIPT_DELIVERED_REQ = "receipt.delivered.req";
export const RECEIPT_DELIVERED_ACK = "receipt.delivered.ack";
export const RECEIPT_DELIVERED_PUSH = "receipt.delivered.push";

// ==================== 错误事件 ====================
export const ERROR_EVENT = "error";
