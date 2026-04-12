# Alea WebApp

## Overview
Alea is a web application for a cultural gaming association that manages room reservations, member accounts, and table check-ins across 6 RPG-themed rooms (Mirkwood, Gondolin, Khazad-dûm, Rivendell, Lothlórien, Edoras). Members browse available tables, make and cancel reservations, and check in via QR codes. Admins manage users, rooms, tables, and reservations through a dedicated dashboard.

**Next priorities:** member self-service (profile/password), admin reporting & stats, calendar/availability view improvements.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 3.4 + shadcn/ui (Radix UI) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth + custom session layer |
| i18n | next-intl 3.26 — locales: `es` (default), `en` |
| Data Fetching | TanStack React Query 5 |
| Validation | Zod + react-hook-form |
| Testing | Vitest 3 + React Testing Library (jsdom) |
| Package Manager | pnpm |

---

## Architecture

### Directory Structure
```
app/
  api/                  # Route Handlers (server API endpoints)
  [locale]/             # Locale-prefixed pages (/es/, /en/)
components/
  ui/                   # shadcn/ui primitives (25+ components)
  auth/, rooms/, reservations/, admin/, check-in/, layout/
lib/
  server/               # Server-side service layer — NEVER client-imported
  supabase/             # Supabase client factories + generated types
  api/                  # Client ApiClient singleton + endpoint constants
  auth/                 # AuthProvider + useAuth hook
  hooks/                # TanStack Query hooks (use-rooms, use-reservations, use-admin)
  i18n/                 # next-intl config + request locale resolver
  types/                # Domain types (User, Room, GameTable, Reservation)
  validations/          # Zod schemas (auth, password)
messages/               # i18n JSON — es.json and en.json must stay in full key parity
supabase/               # SQL migrations, config.toml, seed.sql
__tests__/              # ALL test files — owned exclusively by qa-engineer
docs/                   # ARCHITECTURE.md, DECISIONS.md, HANDOFF.md, SECURITY_RUNBOOK.md
```

### Key Subsystems

**Service Layer (`lib/server/`)** — All business logic. Never imported client-side (`server-only` guard). Enforces privilege checks (ownership + role). Throws `ServiceError`; route handlers convert to HTTP responses via `.toResponse()`.

**Supabase Clients (`lib/supabase/server.ts`)** — Three variants:
- `createSupabaseServerClient()` — anon key, respects RLS (standard reads)
- `createSupabaseRouteHandlerClient()` — anon key, buffers cookie writes for Route Handlers
- `createSupabaseServerAdminClient()` — service role key, bypasses RLS (admin writes only)

**Security Layer (`lib/server/security.ts`)** — CSRF double-submit cookie, Fetch Metadata validation, Origin check, in-memory rate limiting per named bucket. All mutating routes call `enforceMutationSecurity(req)`.

**Auth Flow** — Login with member number or email + password → Supabase session cookies → middleware refreshes token on every request → `requireAuth()` / `requireAdmin()` guards on protected routes.

**Check-in** — QR codes per table. Scanning opens `/check-in/[tableId]`. Service validates reservation is `pending`, within time window, then activates. `removable_top` tables have two bookable surfaces (`top`/`bottom`); booking one blocks the other via DB GIST exclusion constraint.

**i18n** — All pages under `/[locale]/`. Default locale `es`. Every UI string must have a key in both `messages/es.json` and `messages/en.json`.

---

## Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | i18n routing, token refresh, CSRF cookie setup |
| `lib/server/auth.ts` | `requireAuth()`, `requireAdmin()` guards |
| `lib/server/security.ts` | CSRF, rate limiting, Fetch Metadata |
| `lib/server/availability.ts` | Slot generation, conflict detection, surface logic |
| `lib/server/reservations-service.ts` | Reservation CRUD + cancellation cutoff logic |
| `lib/supabase/types.ts` | Generated DB types — update after every schema change |
| `lib/api/client.ts` | ApiClient singleton with CSRF header injection |
| `lib/api/endpoints.ts` | All API path constants |
| `messages/es.json` + `messages/en.json` | i18n — must stay in full parity |
| `supabase/migrations/` | Versioned SQL migrations |
| `docs/ARCHITECTURE.md` | System design, data model, auth flow |
| `docs/DECISIONS.md` | ADRs for key technical decisions |

---

## Conventions

### Service Layer
- Business logic always in `lib/server/` — never inline in route handlers
- Use `createSupabaseServerAdminClient()` for admin writes (bypass RLS)
- Use `createSupabaseServerClient()` for user-scoped reads (respect RLS)
- Throw `ServiceError` for application errors; route handlers call `.toResponse()`

### i18n
- Every new UI string requires a key in BOTH `es.json` and `en.json`
- Keys use dot-notation namespacing matching the component/page hierarchy

### Security
- All mutating API routes must call `enforceMutationSecurity(req)` first
- New rate-limited routes register a named bucket in `lib/server/security.ts`

### TypeScript
- `tsconfig.app.json` excludes test files — never remove this exclusion
- New Supabase RPCs must be registered in `lib/supabase/types.ts` under `public.Functions`
- Never use `as unknown as` casts for Supabase RPC types

### Testing
- All test files live in `__tests__/` — owned exclusively by `qa-engineer`
- `software-engineer` must never create or modify test files
- Coverage thresholds (85%) enforced on auth and security modules

### Parallel worktree file split
| Agent | File ownership |
|-------|----------------|
| Frontend | `app/`, `components/`, `messages/`, `lib/hooks/` |
| Backend | `lib/server/`, `lib/supabase/`, `supabase/`, `__tests__/` |

If a task touches both domains, run agents sequentially.

---

## Testing & Validation

```bash
pnpm typecheck          # TypeScript type-check (no emit)
pnpm build              # Production build + app tsconfig type-check
pnpm test               # Full Vitest suite
pnpm test:coverage      # Coverage report (85% threshold: auth/security)
pnpm test:integration   # Supabase schema/migration checks
pnpm lint               # ESLint via Next.js
```

Run `pnpm typecheck && pnpm build && pnpm test` before opening any PR.

---

## Common Workflows

### Feature branch
```bash
# Create branch
git checkout -b feat/<short-description>

# After implementation
pnpm typecheck && pnpm build && pnpm test

# Open PR targeting develop
gh pr create --base develop
```

### Schema change
1. Add migration to `supabase/migrations/` (versioned filename)
2. Update `lib/supabase/types.ts` to reflect new tables/columns/RPCs
3. Update affected service layer files
4. Run `pnpm test:integration`

### Adding a new page
1. Create route in `app/[locale]/`
2. Add translations to both `messages/es.json` and `messages/en.json`
3. Add server guard (`requireAuth` / `requireAdmin`) if protected
4. Wire client data fetching via a hook in `lib/hooks/`