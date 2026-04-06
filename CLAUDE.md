# Claude Code — Alea Webapp

Project-level rules for Claude Code agents working on this repository.
These rules extend the global `~/.claude/CLAUDE.md` and take precedence where they overlap.

---

## Language

All GitHub artifacts must be in English: issue titles, issue bodies, PR titles, PR descriptions, PR comments, commit messages, and replies to review comments.

The user communicates in Spanish — respond to the user in Spanish, but all GitHub-facing content must be in English.

---

## Agent role discipline

| Task type | Agent | Notes |
|-----------|-------|-------|
| Bug fix / feature / refactor | `software-engineer` (worktree) | Never touches docs |
| README, changelogs, user-facing docs | `tech-writer` | Never touches code |
| ARCHITECTURE.md, ADRs, system design | `solution-architect` | Never touches code |
| Tests / QA validation | `qa-engineer` | Runs after software-engineer |
| Security review | `security-reviewer` | Runs in parallel with qa-engineer |

**software-engineer must never modify `README.md`, `ARCHITECTURE.md`, `docs/`, or any `.md` documentation file.**

---

## Parallel worktrees — no shared files

When two or more worktree agents run in parallel, each must own a **disjoint set of files**. No file may be written by more than one parallel agent.

**Split by domain:**
- Agent A: `messages/`, `components/`, `lib/hooks/`, `app/`
- Agent B: `lib/server/`, `lib/supabase/`, `supabase/`, `__tests__/`

If a file boundary is unclear, run the agents **sequentially** — merge conflicts cost more time than parallelism saves.

Document the file ownership split explicitly in each agent's prompt.

---

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Route Handlers (API routes)
- **Database:** Supabase (Postgres + RLS)
- **Auth:** Supabase Auth + custom session layer
- **i18n:** next-intl — locale files in `messages/en.json` and `messages/es.json`
- **Tests:** Vitest + Testing Library
- **Package manager:** pnpm

## Key conventions

- Admin write operations use `createSupabaseServerAdminClient()` (bypasses RLS)
- Regular reads use `createSupabaseServerClient()` (user-scoped, respects RLS)
- All privilege checks (ownership + role) must live in the **service layer**, never in route handlers
- i18n keys must maintain parity between `en.json` and `es.json`
- Test files must be excluded from `tsconfig.app.json`
