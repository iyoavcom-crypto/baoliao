/**
 * @packageDocumentation
 * @module dto/auth/register
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 注册相关数据传输对象
 */

/**
 * @interface RegisterRequestDto
 * @description 注册请求体
 * @property {string} phone - 手机号
 * @property {string} password - 密码
 * @property {string} nickname - 昵称
 */
export interface RegisterRequestDto {
  phone: string;
  password: string;
  nickname: string;
}

/**
 * @interface RegisterResponseDto
 * @description 注册响应体
 * @property {string} userId - 用户ID
 * @property {string} accessToken - 访问令牌
 * @property {string} refreshToken - 刷新令牌
 * @property {string} nickname - 用户昵称
 * @property {string} phone - 用户手机号
 * @property {number} serverTime - 服务器时间戳
 */
export interface RegisterResponseDto {
  userId: string;
  accessToken: string;
  refreshToken: string;
  nickname: string;
  phone: string;
  serverTime: number;
}