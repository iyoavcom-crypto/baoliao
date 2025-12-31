/**
 * @packageDocumentation
 * @module dto/index
 * @since 1.0.0 (2025-12-26)
 * @author Z-kali
 * @description DTO总入口，统一导出所有数据传输对象
 */

// ======================== 通用公共DTO ========================
export type {
  ApiResponseDto,
  ApiSuccessResponseDto,
  ApiErrorResponseDto,
  ApiValidationErrorDto,
  ApiResponse,
} from "./common/response.dto.js";

export type {
  PageDto,
  CursorDto,
  OffsetDto,
  InfiniteScrollDto,
} from "./common/pagination.dto.js";

export type {
  ListQueryDto,
  CursorQueryDto,
  OffsetQueryDto,
  TimeRangeQueryDto,
  IdsQueryDto,
  FullListQueryDto,
} from "./common/query.dto.js";

// ======================== 认证相关 ========================
export type {
  LoginRequestDto,
  LoginResponseDto,
} from "./auth/login.dto.js";

export type {
  RegisterRequestDto,
  RegisterResponseDto,
} from "./auth/register.dto.js";

// ======================== 用户相关 ========================
export type {
  UserListDto,
  UserDetailDto,
  UserUpdatableDto,
  UserCreatableDto,
} from "./user/user.dto.js";

export type {
  UserListQueryDto,
} from "./user/query.dto.js";

export type {
  UserSearchRequestDto,
  UserSearchResponseDto,
  UserSearchItemDto,
} from "./user/search.dto.js";

export type {
  FriendListDto,
  FriendDetailDto,
  FriendRequestDto,
  FriendAcceptDto,
  FriendBlockDto,
  FriendUpdatableDto,
} from "./user/friend.dto.js";

export type {
  FriendRequestEventListDto,
  FriendRequestEventDetailDto,
  CreateFriendRequestEventDto,
  ReviewFriendRequestEventDto,
  FriendRequestEventQueryDto,
} from "./user/friend-request-event.dto.js";

export type {
  DeviceListDto,
  DeviceDetailDto,
  DeviceCreatableDto,
  DeviceUpdatableDto,
} from "./user/device.dto.js";

export type {
  SessionListDto,
  SessionDetailDto,
  SessionCreatableDto,
} from "./user/session.dto.js";

export type {
  UserPresenceDto,
  UserPresenceUpdateDto,
  UserPresenceBatchDto,
  UserPresenceBatchResponseDto,
  UserPresenceSubscribeDto,
} from "./user/presence.dto.js";

export type {
  TypingIndicatorDto,
  TypingIndicatorStartDto,
  TypingIndicatorStopDto,
  TypingIndicatorBatchDto,
} from "./user/typing.dto.js";

export type {
  UserBlockListDto,
  UserBlockDetailDto,
  UserBlockCreatableDto,
  UserUnblockDto,
  UserBlockCheckDto,
  UserBlockCheckResponseDto,
} from "./user/block.dto.js";

// ======================== 会话相关 ========================
export type {
  ConversationListDto,
  ConversationDetailDto,
  ConversationUpdatableDto,
  ConversationCreatableDto,
} from "./conversation/conversation.dto.js";

export type {
  ConversationListRequestDto,
  ConversationListResponseDto,
  ConversationListItemDto,
} from "./conversation/list.dto.js";

export type {
  ConversationMemberListDto,
  ConversationMemberDetailDto,
  ConversationMemberUpdatableDto,
} from "./conversation/member.dto.js";

export type {
  ConversationPinDto,
  ConversationPinListDto,
  ConversationPinBatchDto,
} from "./conversation/pin.dto.js";

export type {
  ConversationMuteDto,
  ConversationMuteListDto,
  ConversationMuteBatchDto,
} from "./conversation/mute.dto.js";

export type {
  ConversationDraftDto,
  ConversationDraftSaveDto,
  ConversationDraftDeleteDto,
  ConversationDraftBatchDto,
} from "./conversation/draft.dto.js";

export type {
  ConversationClearDto,
  ConversationClearHistoryDto,
  ConversationClearBatchDto,
} from "./conversation/clear.dto.js";

// ======================== 消息相关 ========================
export type {
  MessageListDto,
  MessageDetailDto,
  MessageUpdatableDto,
  MessageCreatableDto,
} from "./message/message.dto.js";

export type {
  MessageListQueryDto,
  MessageCursorQueryDto,
} from "./message/query.dto.js";

export type {
  MessageHistoryRequestDto,
  MessageHistoryResponseDto,
  MessageHistoryItemDto,
} from "./message/history.dto.js";

export type {
  MessageReadListDto,
  MessageReadDetailDto,
  MessageReadRequestDto,
  MessageReadResponseDto,
  MessageReadReportDto,
} from "./message/read.dto.js";

export type {
  MessageDeliveryListDto,
  MessageDeliveryDetailDto,
  MessageDeliveryCreatableDto,
  MessageDeliveryUpdatableDto,
} from "./message/delivery.dto.js";

export type {
  MessageReactionListDto,
  MessageReactionDetailDto,
  MessageReactionCreatableDto,
  MessageReactionDeleteDto,
} from "./message/reaction.dto.js";

export type {
  MessageEditListDto,
  MessageEditDetailDto,
  MessageEditRequestDto,
} from "./message/edit.dto.js";

export type {
  MessageRecallListDto,
  MessageRecallDetailDto,
  MessageRecallRequestDto,
} from "./message/recall.dto.js";

export type {
  OfflineInboxListDto,
  OfflineInboxDetailDto,
  OfflineInboxCreatableDto,
} from "./message/offline.dto.js";

export type {
  MessageDedupListDto,
  MessageDedupDetailDto,
  MessageDedupCheckDto,
  MessageDedupCheckResponseDto,
} from "./message/dedup.dto.js";

export type {
  MessageRequestListDto,
  MessageRequestDetailDto,
  MessageRequestCreatableDto,
  MessageRequestHandleDto,
} from "./message/request.dto.js";

export type {
  MessageMentionListDto,
  MessageMentionDetailDto,
  CreateMessageMentionDto,
  MessageMentionQueryDto,
} from "./message/mention.dto.js";

export type {
  MessageAttachmentListDto,
  MessageAttachmentDetailDto,
  CreateMessageAttachmentDto,
  MessageAttachmentQueryDto,
} from "./message/attachment.dto.js";

export type {
  MessageQuoteListDto,
  MessageQuoteDetailDto,
  MessageQuoteCreatableDto,
  MessageQuoteChainDto,
} from "./message/quote.dto.js";

export type {
  MessageForwardListDto,
  MessageForwardDetailDto,
  MessageForwardCreatableDto,
  MessageForwardBatchDto,
} from "./message/forward.dto.js";

export type {
  MessagePinListDto,
  MessagePinDetailDto,
  MessagePinCreatableDto,
  MessageUnpinDto,
} from "./message/pin.dto.js";

export type {
  MessageSearchDto,
  MessageSearchResultDto,
  MessageSearchResponseDto,
} from "./message/search.dto.js";

// ======================== 群组相关 ========================
export type {
  GroupListDto,
  GroupDetailDto,
  GroupCreatableDto,
  GroupUpdatableDto,
} from "./group/group.dto.js";

export type {
  GroupListQueryDto,
} from "./group/query.dto.js";

export type {
  GroupMemberListDto,
  GroupMemberDetailDto,
  GroupMemberCreatableDto,
  GroupMemberUpdatableDto,
} from "./group/member.dto.js";

export type {
  GroupInviteListDto,
  GroupInviteDetailDto,
  GroupInviteCreatableDto,
  GroupInviteUseDto,
} from "./group/invite.dto.js";

export type {
  GroupJoinRequestListDto,
  GroupJoinRequestDetailDto,
  GroupJoinRequestCreatableDto,
  GroupJoinRequestHandleDto,
} from "./group/join-request.dto.js";

export type {
  GroupEventListDto,
  GroupEventDetailDto,
  GroupEventCreatableDto,
} from "./group/event.dto.js";

export type {
  GroupCapacityListDto,
  GroupCapacityDetailDto,
  GroupCapacityCreatableDto,
} from "./group/capacity.dto.js";

export type {
  GroupAnnouncementListDto,
  GroupAnnouncementDetailDto,
  GroupAnnouncementCreatableDto,
  GroupAnnouncementUpdatableDto,
} from "./group/announcement.dto.js";

export type {
  GroupMuteListDto,
  GroupMuteDetailDto,
  GroupMuteCreatableDto,
  GroupUnmuteDto,
  GroupMuteBatchDto,
} from "./group/mute.dto.js";

export type {
  GroupSettingDto,
  GroupSettingUpdatableDto,
} from "./group/setting.dto.js";

export type {
  GroupFileListDto,
  GroupFileDetailDto,
  GroupFileUploadDto,
  GroupFileDeleteDto,
} from "./group/file.dto.js";

// ======================== 文件相关 ========================
export type {
  FileListDto,
  FileDetailDto,
  FileUploadDto,
  FileUploadResponseDto,
} from "./file/file.dto.js";

export type {
  FileRefListDto,
  FileRefDetailDto,
  FileRefCreatableDto,
} from "./file/ref.dto.js";

export type {
  FileTokenListDto,
  FileTokenDetailDto,
  FileTokenCreatableDto,
} from "./file/token.dto.js";

// ======================== 管理相关 ========================
export type {
  RoleListDto,
  RoleDetailDto,
  RoleCreatableDto,
  RoleUpdatableDto,
} from "./admin/role/role.dto.js";

export type {
  IpBlockListDto,
  IpBlockDetailDto,
  IpBlockCreatableDto,
} from "./admin/safety/ip-block.dto.js";

export type {
  PenaltyListDto,
  PenaltyDetailDto,
  PenaltyCreatableDto,
  PenaltyUpdatableDto,
} from "./admin/safety/penalty.dto.js";

export type {
  RateLimitLogListDto,
  RateLimitLogDetailDto,
  RateLimitLogCreatableDto,
} from "./admin/safety/rate-limit-log.dto.js";

export type {
  ReportListDto,
  ReportDetailDto,
  ReportCreatableDto,
  ReportUpdatableDto,
} from "./admin/safety/report.dto.js";

// ======================== WebSocket相关 ========================
export type {
  WsConnectionListDto,
  WsConnectionDetailDto,
} from "./ws/connection.dto.js";

// ======================== 系统相关 ========================
export type {
  FeatureDefinitionListDto,
  FeatureDefinitionDetailDto,
  FeatureDefinitionCreatableDto,
  FeatureDefinitionUpdatableDto,
} from "./system/feature/definition.dto.js";

export type {
  FeaturePolicyListDto,
  FeaturePolicyDetailDto,
  FeaturePolicyCreatableDto,
  FeaturePolicyUpdatableDto,
} from "./system/feature/policy.dto.js";

export type {
  FeatureAuditLogListDto,
  FeatureAuditLogDetailDto,
  FeatureAuditLogCreatableDto,
} from "./system/feature/audit.dto.js";
