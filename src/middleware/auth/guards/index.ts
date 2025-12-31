/**
 * @packageDocumentation
 * @module middleware/auth/guards
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 守卫模块入口：角色、作用域、VIP、团队与设备绑定守卫导出
 */
export { requireRole } from "./role";
export { requireScopes } from "./scopes";
export { requireVip } from "./vip";
export { requireTeam } from "./team";
export { requireDevice } from "./device";
export { requireUserId } from "./id";
