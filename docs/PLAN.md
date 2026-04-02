# Migration Execution Plan — Alea Webapp

**Last updated:** 2026-04-02
**Branch:** develop
**Epic:** #3 — Next.js API migration (remove NestJS + monorepo)
**Platform:** Supabase (dev + prod, sole DB/auth provider)

---

## Current State

| Milestone | Issue | Status | Branch / PR |
|-----------|-------|--------|-------------|
| M1 — Contract freeze & baseline | #4 | Done | PR #13 (merged) |
| M2 — Server layer extraction | #5 | Done | PR #15 (merged) |
| Platform — Supabase env split | #11 | Done | PR #16 + #20 (merged) |
| QA — CI quality gates | #12 | In Progress | — |
| UI — shadcn + auth foundation | #18 | In Progress | PR #19 (open) |
| M3 — Auth cutover (Supabase SSR) | #6 | Pending | — |
| M4 — API parity | #7 | Pending | — |
| SEC — Security hardening | #10 | Pending | — |
| M5 — Flatten repo / remove NestJS | #8 | Pending | — |
| M6 — Cleanup + release readiness | #9 | Pending | — |

---

## Priority Order

### P0 — Completed

#### Issue #4 — [M1] Contract freeze & baseline
**Branch:** `feat/next-api-m1-baseline`
**PR:** #13 (merged)

#### Issue #5 — [M2] Server layer extraction
**Branch:** `feat/next-api-m2-server-layer`
**PR:** #15 (merged)

#### Issue #11 — [PLATFORM] Supabase environment split
**Branch:** `feat/supabase-env-separation`
**PR:** #16 + #20 (merged)

**Deliverables completed:**
- `@supabase/supabase-js` + `@supabase/ssr` installed
- `supabase/` directory with `config.toml` for local dev
- Initial schema migration: `profiles`, `rooms`, `tables`, `reservations`
- RLS policies with `WITH CHECK` on all UPDATE policies
- Env variable structure: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `.env.example` and `.env.local.example`
- Typed Supabase clients: SSR (`createServerClient`) + admin (`createClient` stateless)
- Signup trigger (`handle_new_user`) for auto-creating profiles
- GiST exclusion constraint for reservation overlap prevention

---

### P0 — In Progress

#### Issue #12 — [QA] Testing stack and CI quality gates
**Branch:** `feat/qa-next-api-gates`
**Status:** CI workflow running, Vitest + test suite in place. Pending: coverage thresholds, Supabase CLI integration tests, Semgrep, dependency audit.

---

### P0.5 — In Progress (before M3)

#### Issue #18 — [UI] shadcn/ui initialization + Supabase auth UI foundation
**Branch:** `feat/shadcn-supabase-ui`
**PR:** #19 (open, review comments addressed)

**Deliverables:**
- shadcn/ui initialized with RPG theme tokens
- Auth UI components (login, register) using Supabase client
- Review comments from PR #19 addressed

---

### P1 — After Supabase + QA + UI ready

#### 3. Issue #6 — [M3] Auth cutover to Supabase SSR
**Branch:** `feat/next-api-m3-auth-cutover`
**Depends on:** #11
**Deliverables:**
- Replace mock auth (`mock-db` users) with Supabase Auth
- Implement `createServerClient` / `createBrowserClient` SSR pattern
- HTTP-only cookies via `@supabase/ssr` cookie helpers
- CSRF protection for unsafe methods (POST/PUT/PATCH/DELETE)
- Auth parity: `login`, `register`, `me`, `logout`
- Frontend no longer contacts NestJS for auth
- Cookie flags: `HttpOnly`, `Secure` in prod, `SameSite=Lax`

---

### P2 — After M3

#### 4. Issue #10 — [SEC] Security hardening (parallel with #7)
**Branch:** `feat/next-api-security-hardening`
**Depends on:** #6
**Deliverables:**
- Env-specific cookie policy finalized
- Rate limiting on auth + sensitive endpoints
- Origin/fetch-metadata checks
- Security runbook documented

#### 5. Issue #7 — [M4] API parity across all domains (parallel with #10)
**Branch:** `feat/next-api-m4-api-parity`
**Depends on:** #6
**Deliverables:**
- Replace `mock-db` with Supabase queries in all services
- `users`, `rooms`, `tables`, `reservations` services rewritten against Supabase
- RLS enforced at DB level, service layer validates above it
- Consistent auth/authz guards across all handlers

---

### P3 — After M4

#### 6. Issue #8 — [M5] Flatten repo / remove NestJS + monorepo
**Branch:** `feat/next-api-m5-flatten-repo`
**Depends on:** #7
**Deliverables:**
- Promote `apps/web` to repo root
- Delete `apps/api` (NestJS) and all NestJS dependencies
- Delete `pnpm-workspace.yaml`, `packages/` workspace
- Move `packages/types` into `apps/web/lib/types`
- Single root `package.json` with `dev`, `build`, `test`, `lint`, `typecheck`
- No monorepo artifacts remain

---

### P4 — Final

#### 7. Issue #9 — [M6] Cleanup, docs, release readiness
**Branch:** `feat/next-api-m6-cleanup`
**Depends on:** #8
**Deliverables:**
- Update `docs/ARCHITECTURE.md` for final single-app structure
- Remove dead code and obsolete env vars
- Rollback procedure documented
- CI passes in final state

---

## Dependency Graph

```
#4 (M1 baseline) ✅ → #5 (M2 server layer) ✅ → #11 (Platform) ✅ ─┐
                                                                      ├→ #6 (M3 Supabase SSR)
#12 (QA gates) 🔄 ────────────────────────────────────────────────────┤
#18 (shadcn + auth UI) 🔄 ───────────────────────────────────────────┘
```

---

## Notes

- Each issue gets its own branch targeting `develop`.
- PRs stay open as review artifacts; user merges manually.
- Never merge to `main` directly — only via release branch.
- Mock-db is replaced incrementally: auth in M3, domains in M4.
- `packages/types` stays in place until M5 flattening.
