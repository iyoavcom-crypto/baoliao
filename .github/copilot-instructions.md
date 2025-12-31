# Copilot Instructions for IMS (Instant Messaging System)

## Project Overview

**WS-Kit**: A Node.js 22+ TypeScript-based instant messaging system combining HTTP REST APIs with WebSocket real-time communication. ~37% complete with 45 Sequelize models, 177 HTTP APIs, and 42 WebSocket events.

### Key Technologies
- **Runtime**: Node.js 22+, TypeScript 5.6+, ESM modules
- **REST API**: Express.js with automated route building from JSON configs
- **Database**: SQLite (dev) / MySQL (prod) via Sequelize ORM
- **WebSocket**: Native `ws` library with custom Req/Ack/Push protocol
- **Testing**: Vitest with coverage reporting
- **Auth**: JWT-based with refresh/access tokens and role-based access control

---

## Critical Architecture Patterns

### 1. **API Route Auto-Building** (`src/routes/builder/`)
Routes are **declaratively defined in JSON** files (`data/api/*.json`) and auto-generated at startup. Never manually create Express route handlers—instead:
- Add API definition to `data/api/*.json` with fields: `id`, `method`, `paths`, `models`, `operateEnum`, `roles`, `authRequired`
- Use auto-generated CRUD handlers via `createCrudService()` or implement custom handlers mapped by API id
- Reference: [Route Builder README](src/routes/builder/README.md)

**Example**:
```json
{
  "id": "user-list",
  "method": "GET",
  "paths": ["/users"],
  "models": ["User"],
  "operateEnum": "list",
  "authRequired": true,
  "roles": ["admin"]
}
```

### 2. **WebSocket Protocol: Req/Ack/Push**
All WebSocket communication follows three patterns:
- **Req** (Request): Client → Server (expects Ack response)
- **Ack** (Acknowledgement): Server → Client (response to Req)
- **Push** (Server-initiated): Server → Client (proactive notifications)

Event naming: `{domain}.{action}.{type}` e.g., `message.send.req`, `message.send.ack`, `message.push`

Architecture files:
- [WebSocket Design](项目/WebSocket架构设计.md) (~1566 lines, read for full context)
- [Implementation Summary](项目/WebSocket实现总结.md)
- Protocol validation: [protocol.ts](src/routes/ws/protocol.ts)
- Connection management: [connection-manager.ts](src/routes/ws/connection-manager.ts)

### 3. **Authentication Flow**
- **HTTP**: JWT middleware (`requireAuth`) validates `Authorization: Bearer <token>` header
- **WebSocket**: Unauthenticated connections send `auth.hello.req` with JWT; server responds with `auth.hello.ack` or closes connection
- **Token Types**: `access` (short-lived, API use) and `refresh` (long-lived, token renewal)
- **Role-based**: `requireRole(roleName)` middleware for HTTP; role checks in WS controllers
- Implementation: [auth.ts](src/middleware/auth/auth.ts), [JwtService](src/tools/jwt/)

### 4. **Service Layer: CRUD Adapter Pattern**
Models are wrapped via `createCrudService<T>(model)` returning standardized CRUD interface:
```typescript
interface CrudService<T> {
  list(options): Promise<{data, total, page, limit}>
  getById(id): Promise<T | null>
  create(data): Promise<T>
  update(id, data): Promise<T>
  remove(id): Promise<void>
  // ... more methods
}
```
Used by auto-generated HTTP handlers and WS controllers. Reference: [crud-adapter.ts](src/services/crud-adapter.ts)

### 5. **Model Organization**
Models grouped by domain in [src/models/](src/models/):
- `admin/`: User, Role, Permission
- `api/`: API metadata
- `conversation/`: Conversation, ConversationMember
- `message/`: Message, MessageReaction, MessageEdit
- `group/`: Group, GroupMember
- `friend/`: Friend, FriendRequest
- `file/`: File metadata
- `system/`: System configurations
- `_shared/`: Reusable mixins (timestamps, flags, etc.)

All models exported through [models/index.ts](src/models/index.ts)

### 6. **Configuration & Environment**
- Database selection: env var `DB_DIALECT` (sqlite | mysql)
- Config centralized: [src/config/](src/config/) with `env` object containing all vars
- Database setup: `initDatabase({sync: true})` in [main.ts](src/main.ts)
- Logging: `getLogger(module)` from [logging tools](src/tools/logging/)

---

## Development Workflows

### Build & Run
```bash
npm run dev              # Start with tsx (hot reload)
npm run build           # Compile TypeScript to dist/
npm run typecheck       # Type checking only
npm run lint            # Import order validation
```

### Database
```bash
npm run seed            # Load seed data from data/seeds/loader.ts
DB_RESET=true npm run dev  # Delete and recreate database
```

### Testing
```bash
npm test                # Run Vitest (watch mode)
npm run test:run        # Single run
npm run test:ui         # Vitest UI dashboard
npm run test:coverage   # Generate coverage reports
npm run test:api        # HTTP API integration tests (custom runner)
```

### Debugging
- Use `env.LOG_LEVEL` (debug|info|warn|error) to control verbosity
- Set `LOG_LEVEL=debug npm run dev` for detailed logs
- Logs include `traceId` in headers for request tracking
- WebSocket connections include device tracking (`X-Device-Id` header)

---

## Project-Specific Conventions

### File Naming & Organization
- Controllers: Domain-specific, e.g., `message.controller.ts` for message events
- Services: Logic layer separate from data access (CRUD)
- Types: Domain-grouped in [src/types/](src/types/)
- Constants: All magic strings in [src/constants/](src/constants/) (never inline)
- Middleware: Auth, logging, CORS, request validation in [src/middleware/](src/middleware/)

### TypeScript Practices
- **Strict mode enabled**: No implicit any, strict null checks
- **Module aliases**: `@/` → `src/` (configured in tsconfig.json)
- **JSDoc tags**: All functions documented with `@param`, `@returns`, `@description`
- **Enums**: Use const objects in constants, not TypeScript enums (better tree-shaking)

### Error Handling
- **HTTP**: Standardized error responses via middleware
- **WebSocket**: Event-based errors in `ack` responses with `code` and `message` fields
- **Database**: Sequelize validation errors caught and wrapped
- Custom error classes: [AuthError](src/tools/jwt/), [ApiError](src/constants/)

### Code Organization
- Entry point: [src/main.ts](src/main.ts) (HTTP + WS server startup)
- App setup: [src/app.ts](src/app.ts) (middleware chain)
- Routes: [src/routes/](src/routes/) with auto-builder and WS server
- Avoid circular imports: Models > Services > Controllers > Routes

---

## Integration Points & Data Flows

### HTTP → Database
1. Request arrives → Auth middleware (`requireAuth`) validates JWT
2. Route handler (auto-generated or custom) invokes CRUD service
3. Service queries Sequelize model
4. Response formatted and sent

### WebSocket → Database
1. Client connects, sends `auth.hello.req` with JWT
2. Connection manager stores authenticated connection
3. Event arrives → Routed to domain controller
4. Controller queries models via CRUD service
5. Push events sent to affected users' connections

### Key Connections
- **Models ↔ CRUD Service**: Sealed interface; all DB access via CRUD methods
- **Routes ↔ Controllers**: HTTP auto-builder binds to controller by API id; WS event router dispatches by event name
- **Auth ↔ JWT Tools**: Centralized token generation/validation in [jwt/](src/tools/jwt/)
- **Logging ↔ All Modules**: Global logger from [logging/](src/tools/logging/) used everywhere

---

## Common Tasks & Examples

### Add a New WebSocket Event
1. Define event types in [src/types/ws/](src/types/ws/)
2. Add event name constant in [src/constants/ws/events.ts](src/constants/ws/events.ts)
3. Create/extend controller in [src/controllers/ws/](src/controllers/ws/) with handler method
4. Register in event router: [src/routes/ws/router.ts](src/routes/ws/router.ts)
5. Add TypeScript definitions for request/response DTO

**Example** (message.send.req):
- Type: [message.ts](src/types/ws/) defines `MessageSendReq`, `MessageSendAck`
- Constant: `WS_EVENTS.MESSAGE_SEND_REQ`
- Handler: [message.controller.ts](src/controllers/ws/message.controller.ts) → `handleMessageSend()`
- Router: Maps event name to controller method

### Add a New HTTP API
1. Create JSON definition in `data/api/{domain}.json`
2. Ensure corresponding model exists in [src/models/](src/models/)
3. If custom logic needed, add handler to custom map in route builder
4. Auto-route generation happens at startup; test with `npm run test:api`

### Query Multiple Models
Use Sequelize associations in models (defined in model files). CRUD service supports `include` option for eager loading:
```typescript
// In controller
const result = await userService.list({
  include: [{ model: Role, attributes: ['id', 'name'] }]
});
```

### Broadcast to Multiple Users
Use `connectionManager` to iterate active connections:
```typescript
// In controller
import { connectionManager } from '@/routes/ws';
const connections = connectionManager.getConnectionsByUserIds([userId1, userId2]);
for (const conn of connections) {
  conn.send({ type: 'message.push', payload: {...} });
}
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [src/main.ts](src/main.ts) | Server startup, DB init, WS server attachment |
| [src/app.ts](src/app.ts) | Express middleware pipeline (auth, CORS, logging) |
| [src/routes/ws/server.ts](src/routes/ws/server.ts) | WebSocket server class (connection handling) |
| [src/routes/ws/router.ts](src/routes/ws/router.ts) | Event → Controller dispatch logic |
| [src/routes/builder/index.ts](src/routes/builder/) | Auto-route generation from JSON configs |
| [src/config/index.ts](src/config/index.ts) | DB instance (SQLite/MySQL selector) |
| [src/models/index.ts](src/models/index.ts) | All 45 Sequelize models exported |
| [src/middleware/auth/auth.ts](src/middleware/auth/auth.ts) | JWT validation for HTTP |
| [src/constants/ws/config.ts](src/constants/ws/config.ts) | WS timeouts, limits, heartbeat intervals |

---

## Testing Strategy

- **Unit tests**: `tests/unit/` using Vitest (test Vitest in sync mode)
- **HTTP API tests**: `tests/http-api/` custom runner (test real endpoints)
- **Coverage**: Exclude config, index files, and main entry
- **Mocking**: Use Sequelize transactions for DB isolation in tests

---

## Gotchas & Anti-Patterns

❌ **Don't** manually write Express routes—use JSON config + auto-builder  
❌ **Don't** access DB directly—always use CRUD service interface  
❌ **Don't** hardcode magic strings—add to `src/constants/`  
❌ **Don't** forget `@/` alias import path resolution in tsconfig  
❌ **Don't** mix HTTP and WS error handling—use domain-specific patterns  

✅ **Do** read WebSocket design docs for protocol details  
✅ **Do** check existing controllers before adding new logic  
✅ **Do** use `connectionManager` for user location/broadcast  
✅ **Do** leverage model associations for data fetching  
✅ **Do** write JSDoc comments, especially for public APIs  

