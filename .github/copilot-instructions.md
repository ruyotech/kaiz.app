# KAIZ Project — AI Copilot Instructions

> **These are non-negotiable rules. Follow them on every change. No exceptions.**

---

## 1. MOBILE — Expo SDK 54 (React Native)

### Stack

- Expo SDK 54 (expo ^54.0.31)
- React Native 0.81.5
- Expo Router (file-based routing)
- TypeScript strict mode
- NativeWind 2.x (Tailwind CSS for React Native)
- Zustand 5.x (UI & client state)
- TanStack React Query 5.x (server state & caching)
- Axios (HTTP client with interceptors)
- Zod + react-hook-form (form validation)
- i18n-js (internationalization)
- react-native-reanimated 4.x (animations)
- expo-image (optimized images)
- @shopify/flash-list 2.x (performant lists)

### Project Structure

```
apps/mobile/
├── app/                    # Expo Router file-based routes
│   ├── (auth)/             # Auth group (login, register)
│   ├── (onboarding)/       # Onboarding flow
│   ├── (tabs)/             # Main tab navigation
│   │   ├── challenges/     # Challenges tab
│   │   ├── command-center/ # Command center tab
│   │   ├── community/      # Community tab
│   │   ├── essentia/       # Essentia tab
│   │   ├── family/         # Family tab
│   │   ├── motivation/     # Motivation tab
│   │   ├── notifications/  # Notifications tab
│   │   ├── pomodoro/       # Pomodoro tab
│   │   ├── sensai/         # SensAI tab
│   │   ├── settings/       # Settings tab
│   │   ├── sprints/        # Sprints tab (tasks, epics, sprints)
│   │   └── _layout.tsx     # Tab navigator layout
│   ├── _layout.tsx         # Root layout
│   └── index.tsx           # Entry redirect
├── components/             # UI components by domain
│   ├── ui/                 # Primitives (Button, Input, Card, AppIcon)
│   ├── calendar/           # Calendar & scheduling components
│   ├── challenges/         # Challenge domain components
│   ├── chat/               # Chat & draft components
│   ├── command-center/     # Command center components
│   ├── community/          # Community domain components
│   ├── essentia/           # Essentia domain components
│   ├── family/             # Family domain components
│   ├── layout/             # Layout wrappers
│   ├── motivation/         # Motivation components
│   ├── navigation/         # Navigation components
│   ├── notifications/      # Notification components
│   ├── pomodoro/           # Pomodoro timer components
│   ├── sensai/             # SensAI domain components
│   └── templates/          # Template components
├── hooks/                  # Custom hooks
│   ├── queries/            # TanStack Query hooks (server state)
│   │   ├── keys.ts         # Query key factories for all domains
│   │   ├── use*.ts         # Domain-specific query/mutation hooks
│   │   └── index.ts        # Barrel export (exception to no-barrel rule)
│   ├── useCalendarSync.ts
│   ├── useTheme.ts
│   └── useTranslation.ts
├── services/               # API layer
│   ├── apiClient.ts        # Axios instance with auth interceptors
│   ├── api.ts              # API namespace functions (17 domains)
│   └── *.ts                # Domain-specific services
├── store/                  # Zustand stores (UI & client state only)
├── providers/              # React context providers
│   ├── QueryProvider.tsx   # TanStack Query client + defaults
│   └── ThemeProvider.tsx   # Theme context
├── constants/              # Static config
│   ├── theme.ts            # Colors, spacing, typography tokens
│   └── icons.ts            # Icon registry (MaterialCommunityIcons)
├── types/                  # Shared TypeScript types
├── utils/                  # Pure helper functions
│   ├── logger.ts           # Centralized logger (replaces console.*)
│   └── *.ts                # formatters, validators, dateHelpers, etc.
├── i18n/                   # Translation files
└── assets/                 # Static assets (images, fonts)
```

### Authentication — Hard Rules

- Use `expo-secure-store` for token storage. **NEVER use AsyncStorage for tokens.**
- Store `accessToken` and `refreshToken` in SecureStore on login
- All auth interceptor logic lives in `services/apiClient.ts` — the single Axios instance:
  1. **Request interceptor**: attaches `Authorization: Bearer {accessToken}` to every request
  2. **Response interceptor**: on 401 → silently calls `/api/v1/auth/refresh` with refreshToken
  3. If refresh succeeds → retries original request with new token
  4. If refresh fails → clears tokens → redirects to login screen
- Token refresh is **mutex-locked** — only one refresh request at a time, all others queued
- On app launch: check token existence → validate via `/auth/me` → route to auth or main
- **NEVER create a second Axios instance** — always import from `services/apiClient.ts`
- All API namespace functions in `services/api.ts` use this shared client

### State Management Architecture

- **Server state** → TanStack React Query (`hooks/queries/`). All API data fetching & caching.
- **UI / client state** → Zustand (`store/`). Navigation state, form drafts, local preferences, UI toggles.
- **NEVER duplicate server data in Zustand** — if it comes from the API, use a query hook.

### Caching & Data Fetching

- Use `@tanstack/react-query` (TanStack Query) for all server state
- `QueryProvider` in `providers/QueryProvider.tsx` configures global defaults:
  - `retry: 2`, `staleTime: 2 min`, `gcTime: 10 min`, `refetchOnWindowFocus: false`
- Exported `STALE_TIMES` constants for per-query overrides:
  - User profile: `5 * 60 * 1000` (5 min)
  - Lists (tasks, challenges, sprints): `2 * 60 * 1000` (2 min)
  - Static content (FAQs, mindset themes): `30 * 60 * 1000` (30 min)
  - Realtime (notifications): `30 * 1000` (30 sec)
- Query key factories live in `hooks/queries/keys.ts` — one factory per domain:
  ```typescript
  export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    bySprint: (sprintId: string) => [...taskKeys.lists(), { sprintId }] as const,
    detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  };
  ```
- Domain hooks in `hooks/queries/use*.ts` wrap `useQuery` / `useMutation`:
  ```typescript
  export const useTasks = (sprintId: string) =>
    useQuery({ queryKey: taskKeys.bySprint(sprintId), queryFn: () => taskApi.getBySprintId(sprintId) });
  export const useCreateTask = () =>
    useMutation({ mutationFn: taskApi.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.lists() }) });
  ```
- Use `queryClient.invalidateQueries` after mutations — never manually refetch
- Prefetch on screen focus where appropriate (`useFocusEffect` + `queryClient.prefetchQuery`)
- **Barrel export exception**: `hooks/queries/index.ts` re-exports all query hooks (this is the ONE allowed barrel file)

### Performance Rules

- **Images**: Use `expo-image` (NOT `Image` from react-native).
  - Use `contentFit` prop (NOT `resizeMode`): `contentFit="cover"`, `contentFit="contain"`
  - Set `cachePolicy="memory-disk"` for network images
  - **Requires native build** — does NOT work in Expo Go. Run `npx expo prebuild` + `npx expo run:ios`.
- **Lists**: Use `FlashList` from `@shopify/flash-list` v2.
  - **v2 breaking change**: `estimatedItemSize` prop is REMOVED. Do not pass it.
  - Never use `FlatList` for lists > 20 items.
- **Memoization**:
  - `React.memo` on ALL card/list-item components (e.g., `TaskCard`, `ChallengeCard`, `StoryCard`).
  - Pattern: `export const FooCard = React.memo(function FooCard(props: Props) { ... });`
  - `useMemo`/`useCallback` for expensive computations and callback props.
- **Bundle**: No barrel exports — direct imports only. **Exception**: `hooks/queries/index.ts` is the one allowed barrel.
- **Animations**: Use `react-native-reanimated` for animations. Never use `Animated` API from react-native.
- **Logging**: Use `utils/logger.ts` — **NEVER use `console.log/warn/error` directly.**
  - `logger.info(tag, message)`, `logger.warn(tag, message)`, `logger.error(tag, message, error?)`
  - Logger silences all output in production except `error()`.

### Code Rules

- Every component file: one default export, typed props interface
- No inline styles — use `StyleSheet.create` or NativeWind classes
- No `any` types — ever. Use `unknown` in catch blocks: `catch (error: unknown)`
- No `console.log` / `console.warn` / `console.error` — use `logger.*` from `utils/logger.ts`
- API responses must have TypeScript interfaces matching backend DTOs (see `types/`)
- Error boundaries on every navigator/stack level
- All user-facing strings in `i18n/` translation files (i18n-js)
- **Forms**: use `react-hook-form` + `zod` resolver. Define schema → infer type → pass to `useForm<T>()`.
- **Folder naming**: singular (`store/`, not `stores/`). Match what's already in the repo.
- **tsconfig.json**: `"module": "esnext"` is required (supports dynamic imports in Metro)

---

## 2. WEB — Next.js 15 (App Router)

### Stack

- Next.js 15 (App Router)
- React 19
- TypeScript strict mode
- Tailwind CSS 4

### Project Structure

```
apps/web/
├── app/                    # App Router
│   ├── (public)/           # Public pages (landing, pricing)
│   ├── (auth)/             # Auth pages (login, register)
│   ├── (dashboard)/        # Protected pages
│   ├── admin/              # Admin panel
│   ├── layout.tsx          # Root layout
│   └── not-found.tsx
├── components/             # Shared UI
│   ├── ui/                 # Primitives
│   └── features/           # Domain components
├── lib/                    # Utilities, API client, auth helpers
├── hooks/                  # Client-side hooks
├── types/                  # Shared types
└── public/                 # Static assets
```

### Rendering Rules

- **Default to Server Components.** Only add `'use client'` when you need interactivity, hooks, or browser APIs.
- Data fetching in Server Components via `async` functions — not `useEffect`
- Use `loading.tsx` for streaming/suspense fallbacks
- Use `error.tsx` for error boundaries at route level
- Metadata: use `generateMetadata` for dynamic SEO, `metadata` export for static

### Authentication

- Use `next-auth` v5 (Auth.js) or middleware-based JWT validation
- Store session server-side. Access token in HTTP-only cookie — **never expose to client JS**
- Middleware (`middleware.ts`) protects routes:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/(auth)');
  const isProtected = request.nextUrl.pathname.startsWith('/(dashboard)');
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');

  if ((isProtected || isAdmin) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/(dashboard)/:path*', '/admin/:path*', '/(auth)/:path*'] };
```

### Admin Panel

- Admin routes under `/admin/*`
- Admin auth uses separate endpoint: `POST /api/v1/admin/auth/login`
- Admin tokens stored in HTTP-only cookies (not localStorage in production)
- Role-based access: check `admin.role` before rendering admin sections

### Caching & Data Fetching

- Server Components: use `fetch` with Next.js cache options:
  ```typescript
  // Static data — cache indefinitely, revalidate manually
  fetch(url, { next: { tags: ['site-content'] } });

  // Dynamic data — revalidate periodically
  fetch(url, { next: { revalidate: 300 } }); // 5 min

  // Always fresh
  fetch(url, { cache: 'no-store' });
  ```
- Use `revalidateTag()` and `revalidatePath()` in Server Actions after mutations
- Client Components: use `@tanstack/react-query` with same patterns as mobile
- **Never fetch in `useEffect` for initial data** — pass from Server Component as props or use Suspense

### Performance Rules

- Use `next/image` for all images — never raw `<img>`
- Use `next/font` for fonts — never external font links
- Dynamic imports for heavy components: `dynamic(() => import('./HeavyChart'), { ssr: false })`
- Route groups for code splitting
- `<Suspense>` boundaries around async components

### Code Rules

- Co-locate: component + its types + its styles in same directory
- Server Actions for form submissions — not API routes
- Zod for all form validation (shared schemas with backend if possible)
- No `any` types
- No `useEffect` for data fetching
- CSS: Tailwind utility classes. No CSS modules unless genuinely needed.

---

## 3. BACKEND — Java 21 + Spring Boot 3.4.1

### Stack

- Java 21 (LTS)
- Spring Boot 3.4.1
- Spring Security 6.x + JWT (JJWT)
- Spring AI 1.0.0 (Anthropic — Claude claude-sonnet-4-20250514)
- PostgreSQL 16 + Flyway (29 migrations, V1–V29)
- Caffeine (in-process caching, 3 tiers)
- MapStruct 1.6.3 + Lombok (mapping & boilerplate)
- Spotless (code formatting — enforced on every build)
- Docker multi-stage + GCP Cloud Run
- Bucket4j 8.10.1 (rate limiting — dependency available)

### Project Structure — Hexagonal Per Module

```
apps/backend/src/main/java/app/kaiz/
├── KaizApplication.java
├── shared/                         # Cross-cutting concerns
│   ├── config/                     # SecurityConfig, CacheConfig, CorsConfig, JwtProperties
│   ├── exception/                  # GlobalExceptionHandler, ResourceNotFoundException,
│   │                               # BadRequestException, ForbiddenException, UnauthorizedException,
│   │                               # AIProcessingException
│   ├── persistence/                # BaseEntity (audit fields)
│   ├── security/                   # JwtAuthFilter, JwtProvider, JwtAuthEntryPoint
│   ├── storage/                    # CloudStorageService (GCS)
│   └── util/                       # MessageService (i18n)
│
├── identity/                       # User, Auth, RefreshToken
│   ├── api/                        # AuthController, UserController
│   ├── application/                # AuthService, UserService, UserMapper
│   │   └── dto/                    # LoginRequest, RegisterRequest, UserResponse, etc.
│   ├── domain/                     # User, RefreshToken entities
│   └── infrastructure/             # UserRepository, RefreshTokenRepository
│
├── admin/                          # Admin panel (separate auth flow)
│   ├── api/                        # AdminAuthController, AdminContentController, etc.
│   ├── application/                # AdminAuthService, AdminContentService,
│   │   │                           # AdminCommandCenterService, KnowledgeHubService
│   │   └── dto/                    # AdminDtos (records)
│   ├── domain/                     # AdminUser, SiteContent, Faq, PricingTier,
│   │   │                           # LlmProvider, SystemPrompt, etc.
│   │   └── crm/                    # Lead, Testimonial
│   └── infrastructure/             # All admin repositories (AdminUserRepository, LeadRepository, etc.)
│
├── tasks/                          # Tasks, Epics, Sprints, Tags, Templates
│   ├── api/                        # TaskController, EpicController, SprintController, etc.
│   ├── application/                # TaskService, EpicService, SprintService,
│   │   │                           # TaskTemplateService, UserTagService, OnboardingService, SdlcMapper
│   │   └── dto/                    # TaskDto, EpicDto, SprintDto (records)
│   ├── domain/                     # Task, Epic, Sprint, UserTag, TaskTemplate, etc.
│   └── infrastructure/             # TaskRepository, EpicRepository, SprintRepository, etc.
│
├── command_center/                 # AI Smart Input, Drafts, Streaming
│   ├── api/                        # CommandCenterController (REST + SSE streaming)
│   ├── application/                # CommandCenterAIService, StreamingAIService,
│   │   │                           # DraftApprovalService, ChatModelProvider,
│   │   │                           # AIResponseParser (shared parsing utility),
│   │   │                           # AIConversationLogger, SystemPromptService
│   │   └── dto/                    # CommandCenterAIResponse, SmartInputResponse,
│   │                               # DraftActionRequest/Response, SmartInputRequest, etc.
│   ├── domain/                     # PendingDraft, Draft (sealed), DraftType, DraftStatus
│   └── infrastructure/             # PendingDraftRepository
│
├── sensai/                         # SensAI conversational AI assistant
│   ├── api/                        # SensAIController, SmartInputController
│   ├── application/                # SensAIService, SmartInputAIService (orchestrator),
│   │   │                           # SmartInputResponseParser, DraftPersistenceService,
│   │   │                           # ConversationSessionStore, SensAIMapper
│   │   └── dto/                    # SensAI DTOs
│   ├── domain/                     # SensAIConversation, SensAIMessage
│   └── infrastructure/             # SensAIConversationRepository, etc.
│
├── challenge/                      # Challenges, Templates, Entries, Participants
├── community/                      # Articles, Q&A, Stories, Groups (CommunityService = facade)
├── essentia/                       # Books, categories, user library
├── family/                         # Family members, invitations
├── life_wheel/                     # LifeWheelArea, EisenhowerQuadrant (cached lookups)
├── mindset/                        # MindsetTheme, MindsetContent (cached)
└── notification/                   # Notifications, preferences, scheduling
    # Each module follows: api/ → application/ (+ dto/) → domain/ → infrastructure/
```

### Architecture Rules — ENFORCED

- **Hexagonal per module**: `api/` → `application/` → `domain/` → `infrastructure/`. **No skipping layers.**
- **ArchUnit tests enforce**: Controllers in `api`, Services in `application`, Repositories in `infrastructure`.
- Controllers: only request mapping, `@Valid`, delegation. **Zero business logic.**
- Services: all business logic. `@Service` + `@Transactional` (class-level `readOnly = true`, method-level `@Transactional` for writes).
- Repositories: extend `JpaRepository`. Custom queries via `@Query` or Specifications.
- DTOs: **Java records** for Request/Response. **Never expose entities in API responses.**
- Mappers: **MapStruct interfaces** (`@Mapper(componentModel = "spring")`), one per module. **No manual mapping in services.**
- **Facade pattern** for god-object prevention: If a service exceeds ~400 lines, split into focused sub-services and create a thin facade that delegates. Examples: `CommunityService` (facade → 8 sub-services), `SmartInputAIService` (orchestrator → 3 sub-services).

### Dependency Injection — Hard Rules

- **Always `@RequiredArgsConstructor`** (Lombok) — constructor injection only.
- **NEVER `@Autowired` on fields.** No exceptions.
- If a service needs many dependencies (>7), it's a sign to split the service.

### Logging — Hard Rules

- **Every `@Service` class MUST have `@Slf4j`** (Lombok annotation). No exceptions.
- **NEVER use `System.out.println`** or `System.err.println` — use `log.info/debug/warn/error`.
- Log at these levels:
  - `log.debug(...)` — method entry/exit, detailed flow (disabled in prod)
  - `log.info(...)` — business events: entity created, state changed, cache hit/miss
  - `log.warn(...)` — recoverable issues: validation failures, fallback activated
  - `log.error(...)` — unexpected failures, always include exception: `log.error("msg", e)`
- **All public service methods must have at least one meaningful log statement.**
- Use structured format: `log.info("Task created: userId={}, taskId={}", userId, task.getId())`
- **AI services**: Log provider info, request/response timing, token usage, parse results.

### Exception Handling — Hard Rules

- **Use project exceptions only** — all live in `shared/exception/`:
  - `ResourceNotFoundException` — 404 (entity not found by ID)
  - `BadRequestException` — 400 (invalid input beyond validation)
  - `ForbiddenException` — 403 (access denied)
  - `UnauthorizedException` — 401 (auth failure)
  - `ApiException` — 500 (generic server error)
- **NEVER throw raw `RuntimeException` or `IllegalArgumentException` for business logic.**
  - ✅ `throw new ResourceNotFoundException("Task", taskId)`
  - ❌ `throw new RuntimeException("Task not found")`
- **NEVER use empty catch blocks**: `catch (Exception e) {}` — always log + handle or rethrow.
- **Narrow your catches**: Catch the specific exception, not `Exception`:
  - ✅ `catch (JsonProcessingException e)` — JSON parsing
  - ✅ `catch (DataAccessException e)` — database errors
  - ✅ `catch (JwtException e)` — JWT validation
  - ❌ `catch (Exception e)` — only as last-resort fallback with full logging
- **Acceptable broad catch pattern** (AI services only): When AI responses are unpredictable, a broad catch with logging + meaningful fallback is OK:
  ```java
  try { ... }
  catch (Exception e) {
    log.error("Failed to parse AI response: {}", e.getMessage(), e);
    return fallbackDraft();  // MUST provide a fallback, never swallow
  }
  ```
- **`Optional` usage**: NEVER call `.get()` — use `.orElseThrow(() -> new ResourceNotFoundException(...))`.
- `GlobalExceptionHandler` maps all project exceptions to proper HTTP status codes.

### Entity & JPA Rules

- **All entities extend `BaseEntity`** which provides audit fields: `created_at`, `updated_at`, `created_by`, `updated_by`.
- **NEVER use `FetchType.EAGER`** on relationships. Default is LAZY for all:
  - `@ManyToOne(fetch = FetchType.LAZY)` — already the JPA default for `@ManyToOne` but be explicit.
  - `@OneToMany(fetch = FetchType.LAZY)` — default, state it.
  - `@ElementCollection(fetch = FetchType.LAZY)` — **NOT the default**, must be explicit.
- Use `@EntityGraph` or `JOIN FETCH` queries when you need eager loading for specific use cases.
- Use `@Enumerated(EnumType.STRING)` — **NEVER use ordinal**.
- Entity classes: `@Entity`, `@Table`, `@Builder`, `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`.

### AI / Spring AI — Architecture

- **Single AI provider**: Anthropic (Claude) via `spring-ai-starter-model-anthropic`.
- **ChatModelProvider** (`command_center/application/`): Bridges admin DB config → runtime `ChatModel`. Reads `LlmProvider` settings from admin panel, caches the model instance.
- **AIResponseParser** (`command_center/application/`): **Shared utility** for parsing AI JSON responses into domain `Draft` objects. Used by both `CommandCenterAIService` and `SmartInputAIService`. **NEVER duplicate parsing logic** — always delegate to `AIResponseParser`.
- **StreamingAIService**: SSE streaming endpoint for real-time AI responses to mobile.
- **SystemPromptService**: Loads prompts from DB (`system_prompts` table), cached 15 min.
- **AIConversationLogger**: Structured logging for all AI conversations (input, prompt, response, timing).
- When adding new AI features:
  1. Reuse `ChatModelProvider` — never create a new `ChatModel` instance.
  2. Reuse `AIResponseParser` for any JSON → Draft parsing.
  3. Log every AI call via `AIConversationLogger`.
  4. Keep prompts in DB (Flyway seed), not hardcoded in Java.

### API Design

- Base path: `/api/v1/`
- RESTful: `GET /tasks`, `POST /tasks`, `PUT /tasks/{id}`, `DELETE /tasks/{id}`
- Pagination: `PagedResponse<T>` wrapper with `page`, `size`, `totalElements`
- Error responses: consistent `ApiResponse` wrapper with `success`, `message`, `data`, `errors`
- Validation: `@Valid` on request bodies + Jakarta validation annotations
- SSE streaming: `text/event-stream` media type for AI streaming endpoints

### Security / Auth

- JWT access token (15 min expiry) + refresh token (7 day expiry)
- Access token in `Authorization: Bearer` header
- Refresh token in DB (`refresh_tokens` table) — revocable
- Spring Security filter chain validates JWT on every request — catches `JwtException` specifically.
- CORS: **Property-driven whitelist** via `kaiz.cors.allowed-origins` in `application.yml`. **NEVER use wildcard `*` in production.**
- Role-based: `@PreAuthorize("hasRole('ADMIN')")` on all admin endpoints
- Admin auth is a separate flow: `/api/v1/admin/auth/*`
- `@EnableMethodSecurity` on `SecurityConfig` — method-level security is active.

### Caching — Caffeine (3 Tiers)

All caches are defined in `CacheConfig.java` with explicit TTL and max-size bounds. **Every cache name used in `@Cacheable` MUST have a matching entry in `CacheConfig`.**

| Tier | TTL | Max Entries | Caches |
|------|-----|-------------|--------|
| **Static data** | 30 min | 100–200 | `lifeWheelAreas`, `eisenhowerQuadrants`, `mindsetThemes`, `mindsetContent`, `challengeTemplates`, `essentiaBooks`, `essentiaCategories`, `globalTemplates` |
| **Admin-managed** | 15 min | 50–200 | `siteContent`, `faqs`, `features`, `pricing`, `systemPrompts`, `knowledgeCategories`, `knowledgeItems` |
| **Per-user** | 5 min | 500 | `currentSprint` |

**Hard rules:**
- **Every `@Cacheable` must have a matching `@CacheEvict`** on the mutation path. Never serve stale data after writes.
- **NEVER define a cache in `CacheConfig` without a corresponding `@Cacheable` annotation** — dead caches waste memory.
- Cache keys must include user context when data is user-specific: `@Cacheable(value = "currentSprint", key = "#userId")`
- When adding a new cache: add to `CacheConfig` → add `@Cacheable` on read → add `@CacheEvict` on write.

```java
@Cacheable(value = "siteContent", key = "#section")
public SiteContentResponse getSiteContent(String section) { ... }

@CacheEvict(value = "siteContent", key = "#request.section")
public SiteContentResponse updateSiteContent(UpdateSiteContentRequest request) { ... }
```

### Database & Flyway — CRITICAL

**Read these. Violations break production.**

1. **NEVER modify migrations V1–V29** — they are deployed. Create V30+ for changes.
2. **Version numbers are sequential** — check `db/migration/` for next number. Currently at **V29**.
3. **Enum values UPPERCASE** in CHECK constraints (matches `@Enumerated(EnumType.STRING)`).
4. **Defensive SQL**: `IF NOT EXISTS` / `IF EXISTS` on all DDL.
5. **Audit columns on every entity table**: `created_at`, `updated_at`, `created_by`, `updated_by`.
6. **Naming**: `V{N}__{snake_case_description}.sql` (double underscore).
7. **`ddl-auto: validate`** in production — Hibernate validates schema against entities but **never** modifies it. Only Flyway changes the schema.
8. **`ddl-auto: update`** in dev only (`application-dev.yml`).

```sql
-- Adding a column (V30+)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20)
  CHECK (priority IS NULL OR priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'));
```

### Code Formatting — Spotless

- **Spotless Maven Plugin** is configured and enforced. Run before every commit:
  ```bash
  ./mvnw spotless:apply   # Auto-format
  ./mvnw spotless:check   # Verify formatting (CI gate)
  ```
- **Always run `./mvnw spotless:apply` after any code change** — Spotless controls import ordering, indentation, and line wrapping.
- Import order is managed by Spotless — **do not manually reorder imports**.

### Build & Deploy Workflow — MANDATORY

**Every backend change follows this exact sequence. No shortcuts.**

```bash
# Step 0: Format + compile (ALWAYS first)
cd apps/backend
./mvnw spotless:apply && ./mvnw compile -q

# Step 1: Run tests
./mvnw test -q
# Known: 5 pre-existing ArchUnit failures (admin/repository package). Zero other failures allowed.

# Step 2: Local Docker build + test
docker-compose down
docker-compose up --build -d
sleep 15
docker-compose logs app  # CHECK: no errors, Flyway success, "Started" message

# Step 3: Local health check
curl -s http://localhost:8080/actuator/health | jq .
# MUST return: {"status":"UP"}

# Step 4: ONLY if Step 1+2+3 pass → deploy to GCP
gcloud builds submit --tag us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api
gcloud run deploy kaiz-api \
  --image us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api:latest \
  --region us-central1 --platform managed

# Step 5: Verify GCP
curl -s https://kaiz-api-213334506754.us-central1.run.app/actuator/health
```

### Verify GCP Database Directly

**Always use `PGPASSWORD` env var — NEVER use `gcloud sql connect` (interactive prompt, AI can't handle).**

```bash
# Check tables exist
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp -c "\dt"

# Check Flyway migration history
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp -c \
  "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;"

# Run a quick query
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp -c "SELECT COUNT(*) FROM users;"

# Run a SQL file against GCP DB
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp -f scripts/some_script.sql

# Nuclear reset (drop all + let Flyway recreate on next deploy)
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO kaizapp;
"
```

### Check Cloud Run Logs (When Deploy Fails)

```bash
# Quick error check
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kaiz-api AND severity>=ERROR" --limit=10 --format="table(timestamp,textPayload)"

# Full logs filtered for errors
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kaiz-api" --limit=100 --format="value(textPayload)" | grep -E "Exception|Error|failed|Flyway|migration|Started"

# Check which revision is serving
gcloud run revisions list --service=kaiz-api --region=us-central1 --limit=5
```

**STOP DEPLOYMENT if any of these occur locally:**
- Flyway migration errors (checksum mismatch, SQL syntax)
- Bean creation / injection failures
- Container restart loops
- Health endpoint returns DOWN or non-200
- Any `Exception` or `Error` in logs

### Code Quality Rules — Summary

| Rule | Why | Violation Fix |
|------|-----|---------------|
| `@RequiredArgsConstructor` only | Constructor injection, testable | Remove `@Autowired` field injection |
| `@Slf4j` on every `@Service` | Observability, debugging | Add annotation + meaningful log calls |
| No `Optional.get()` | NPE risk | Use `.orElseThrow(ResourceNotFoundException::new)` |
| No raw SQL in Java | Flyway is single DDL source | Use `@Query` for reads, Flyway for schema |
| No `System.out.println` | Production logging | Use `log.*` via `@Slf4j` |
| No empty catch blocks | Silent failures | Log + handle or rethrow with context |
| Narrow catches | Precision error handling | `catch (SpecificException e)` not `catch (Exception e)` |
| No `FetchType.EAGER` | N+1 queries, perf | Use `LAZY` + `@EntityGraph` / `JOIN FETCH` |
| No entity in API response | Coupling, security | Use DTOs (records) + MapStruct |
| No duplicate code | DRY principle | Extract to shared utility (e.g., `AIResponseParser`) |
| Services < 400 lines | SRP / maintainability | Split into facade + focused sub-services |
| Methods < 30 lines | Readability | Extract private methods |
| Records for DTOs | Immutability, less boilerplate | `public record FooRequest(String name) {}` |
| `@Transactional(readOnly = true)` class-level | Default safe mode | Override with `@Transactional` on writes |
| Run `spotless:apply` | Consistent formatting | Before every commit |

### Application Profiles

| Profile | File | Purpose |
|---------|------|---------|
| default | `application.yml` | Shared config, `ddl-auto: validate`, SQL logging WARN |
| dev | `application-dev.yml` | `ddl-auto: update`, debug logging, JWT dev fallback |
| prod | `application-prod.yml` | Production CORS domains, strict security |
| test | `application-test.yml` | Test database, isolated config |

---

## Cross-Cutting Rules (All Platforms)

### Git Discipline

- Branch naming: `feature/`, `fix/`, `refactor/` prefix
- Commit messages: imperative mood, max 72 chars. Example: `feat(tasks): add priority field to task entity`
- One logical change per commit

### Environment Config

- **NEVER hardcode** API URLs, secrets, keys, or credentials in source code
- Mobile: use `expo-constants` + `.env` files via `app.config.ts`
- Web: use `.env.local` with `NEXT_PUBLIC_` prefix for client vars
- Backend: use `application.yml` profiles + GCP Secret Manager

### Centralized Theme

- All visual tokens (colors, spacing, typography, border radii, shadows) must be defined in a single theme source of truth per platform:
  - **Mobile**: `constants/theme.ts`
  - **Web**: `lib/theme.ts` (exposed via Tailwind config where applicable)
- **No hardcoded values** — every color, spacing unit, font size, and radius must reference the theme. Never use raw hex codes, pixel values, or font names directly in components or stylesheets.
- Theme must export named semantic tokens, not just raw values:
  - Colors: `primary`, `secondary`, `accent`, `background`, `surface`, `text`, `textSecondary`, `border`, `error`, `success`, `warning`
  - Spacing: `xs`, `sm`, `md`, `lg`, `xl`, `xxl`
  - Typography: `heading`, `subheading`, `body`, `caption`, `label` (with size, weight, lineHeight)
  - Radii: `sm`, `md`, `lg`, `full`
- Support light/dark mode from day one — even if dark mode is not yet implemented, structure the theme to allow it without refactoring.
- When branding, colors, or typography change, **only the theme file should change** — zero component edits.
- Web Tailwind config must extend from theme tokens — no standalone Tailwind color overrides outside the theme.

### Centralized Icon System

#### Mobile (`constants/icons.ts` + `components/ui/AppIcon.tsx`)

- All icons are registered in `constants/icons.ts` using `MaterialCommunityIcons` names.
- Icons are organized by category: `navIcons`, `moduleIcons`, `actionIcons`, `statusIcons`.
- Helper function `mci(name)` creates an `IconDef` typed object.
- The `<AppIcon>` component renders any `IconDef` — accepts `icon`, `size`, and `color` props.
- **All components import icon definitions from `constants/icons`** — never hardcode icon strings.
- Icon names must be semantic (what it represents):
  - ✅ `icons.task`, `icons.notification`, `icons.settings`
  - ❌ Hardcoded strings like `"checkbox-marked"`, `"bell"`, `"cog"`
- When changing an icon, **only `constants/icons.ts` changes** — zero component edits.

```typescript
// Usage pattern
import { navIcons } from '../../constants/icons';
import { AppIcon } from '../ui/AppIcon';

<AppIcon icon={navIcons.sprints} size={24} color={theme.colors.primary} />
```

#### Web (`public/icons/` + `components/ui/icons/`)

- SVG-based icon system. Icon index re-exports by semantic name.
- `<Icon>` component accepts `name`, `size`, `color` props.

### API Contract

- Mobile and Web consume the same backend API
- DTOs and types should mirror backend response shapes
- When backend adds a new field → update mobile types + web types in the same PR

### Error Handling

- Every API call must handle: network error, 400 (validation), 401 (auth), 403 (forbidden), 404, 500
- Show user-friendly messages — never raw error objects or stack traces
- Log errors with context (endpoint, params, user) for debugging

### Testing

- Backend: unit tests for services, integration tests for controllers
- Web: React Testing Library for components
- Mobile: Jest + React Native Testing Library
- Test before commit. Broken tests = blocked deploy.