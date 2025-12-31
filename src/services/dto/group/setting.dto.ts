/**
 * @packageDocumentation
 * @module dto/group/setting
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 群设置相关数据传输对象
 */

/**
 * @interface GroupSettingDto
 * @description 群设置
 * @property {number} groupId - 群组ID
 * @property {boolean} requireApproval - 加群是否需要审批
 * @property {boolean} allowMemberInvite - 是否允许成员邀请
 * @property {boolean} muteAll - 是否全员禁言
 * @property {boolean} showMemberNickname - 是否显示成员昵称
 * @property {boolean} allowMemberAtAll - 是否允许成员@全体
 * @property {string | null} joinQuestion - 入群问题
 * @property {Date} updatedAt - 更新时间
 */
export interface GroupSettingDto {
  groupId: number;
  requireApproval: boolean;
  allowMemberInvite: boolean;
  muteAll: boolean;
  showMemberNickname: boolean;
  allowMemberAtAll: boolean;
  joinQuestion: string | null;
  updatedAt: Date;
}

/**
 * @interface GroupSettingUpdatableDto
 * @description 群设置可更新字段
 * @property {boolean} requireApproval - 加群是否需要审批
 * @property {boolean} allowMemberInvite - 是否允许成员邀请
 * @property {boolean} muteAll - 是否全员禁言
 * @property {boolean} showMemberNickname - 是否显示成员昵称
 * @property {boolean} allowMemberAtAll - 是否允许成员@全体
 * @property {string} joinQuestion - 入群问题
 */
export interface GroupSettingUpdatableDto {
  requireApproval?: boolean;
  allowMemberInvite?: boolean;
  muteAll?: boolean;
  showMemberNickname?: boolean;
  allowMemberAtAll?: boolean;
  joinQuestion?: string;
}
