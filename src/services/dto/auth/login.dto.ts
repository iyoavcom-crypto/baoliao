/**
 * @packageDocumentation
 * @module dto/auth/login
 * @since 1.0.0 (2025-12-23)
 * @author Z-kali
 * @description 登录相关数据传输对象
 * @note 登录 DTO 为接口定义型，不需要白名单模式
 */

/**
 * @interface LoginRequestDto
 * @description 登录请求体
 * @property {string} phone - 手机号
 * @property {string} password - 密码
 */
export interface LoginRequestDto {
  phone: string;
  password: string;
}

/**
 * @interface LoginResponseDto
 * @description 登录响应体
 * @property {string} accessToken - 访问令牌
 * @property {string} refreshToken - 刷新令牌
 * @property {number} serverTime - 服务器时间戳
 */
export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  serverTime: number;
}

