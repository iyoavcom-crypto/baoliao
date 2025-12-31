import type { JwtUserPayload } from "@/types/jwt";
import { AuthError, AuthErrorCode } from "../errors/index";

export { assertAppCode } from "./app";
export { assertUserCode } from "./code";
export { assertDevice } from "./device";
export { assertUserId } from "./id";
export { assertRole } from "./role";
export { assertScopes } from "./scopes";
export { assertTeam } from "./team";
export { assertVip } from "./vip";

export function assertTokenKind(payload: JwtUserPayload, tokenKind: "access" | "refresh") {
  if (payload.tokenType !== tokenKind) {
    throw new AuthError(AuthErrorCode.Forbidden, "Token kind denied", 403);
  }
  return payload;
}
