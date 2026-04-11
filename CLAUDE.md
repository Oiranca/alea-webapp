# Claude Code — Alea Webapp

All process rules (language, agent pipeline, worktrees, git, documentation discipline) are defined in
`~/.claude/CLAUDE.md` and apply here without modification. This file only adds project-specific context.

---

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Route Handlers (API routes)
- **Database:** Supabase (Postgres + RLS)
- **Auth:** Supabase Auth + custom session layer
- **i18n:** next-intl — locale files in `messages/en.json` and `messages/es.json`
- **Tests:** Vitest + Testing Library
- **Package manager:** pnpm

---

## GitHub communication language

All GitHub-facing text **must be written in English** — this includes:
- PR comment replies
- Inline review responses
- Issue comments
- Commit messages

The user may write prompts in any language; replies to the user are in their language. All GitHub artifacts are in English.

---

## Key conventions

- Admin write operations use `createSupabaseServerAdminClient()` (bypasses RLS)
- Regular reads use `createSupabaseServerClient()` (user-scoped, respects RLS)
- All privilege checks (ownership + role) must live in the **service layer**, never in route handlers
- i18n keys must maintain full parity between `en.json` and `es.json`
- Test files must be excluded from `tsconfig.app.json`
- Test files are owned exclusively by `qa-engineer` — `software-engineer` must never create or modify test files

### Reservation status filter rule

When adding a new blocking reservation status (e.g. `pending`, `confirmed`), **grep ALL `.eq('status', ...)` and `.in('status', [...])` in `lib/server/`** and update every availability query to include the new status. Conflict-detection and availability queries must always use the same status set. Failing to do this makes booked slots appear available, which causes booking failures at form submission.

### Supabase RPC typing rule

New Postgres RPC functions must be typed in `lib/supabase/types.ts` under `public.Functions` — never use a local `type SomeRpcClient = { rpc: ... }` workaround with `as unknown as` cast. Format: `your_fn: { Args: Record<PropertyKey, never>; Returns: number }` for no-argument functions. This file is manually maintained in this project (no `supabase gen types` in CI).

---

## Parallel worktree file split (for this project)

When running parallel implementation agents on this repo, use this domain split to avoid conflicts:

| Agent | File ownership |
|-------|----------------|
| A (frontend) | `app/`, `components/`, `messages/`, `lib/hooks/` |
| B (backend)  | `lib/server/`, `lib/supabase/`, `supabase/`, `__tests__/` |

If a task touches both domains, run agents **sequentially**.
