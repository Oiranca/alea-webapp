# Session Handoff

> Update this file at the end of every work session before closing Claude Code.
> The next session must read this file first before doing anything.

---

## Last updated: 2026-04-11

## Current branch
`develop`

## Open PRs
None — PR #75 merged ✅

## Issues to mark Done in Linear
| Issue | Title |
|---|---|
| KIM-316 | Generate and persist table QR codes |
| KIM-324 | QR check-in flow — table activation on arrival |

---

## M1 — Completed ✅ (KIM-316 + KIM-324)
- DB migration: `pending` + `no_show` status, `activated_at`, `qr_code_inf`
- QR generation on table creation (absolute URL via `NEXT_PUBLIC_APP_URL`)
- `activateReservationByTable` service with 20-min window + error codes
- `POST /api/reservations/[id]/activate` + `POST /api/tables/[id]/qr`
- `/check-in/[tableId]` page with auth guard
- Admin rooms section: QR display + download + regenerate
- Status badges for `pending` / `no_show`
- 205 tests passing (14 new)

### Hardening deferred
KIM-357 — surface filter bug, timezone anchoring, TOCTOU race, QR regen rate limit (all LOW/MEDIUM)

---

## Next milestone to execute: M2

**Issue:** KIM-327 — Auto-cancel reservations not activated within 20-minute grace period
**Branch to create:** `feat/auto-cancel-grace-period` (from `develop`)
**Blocked by:** Nothing — M1 is merged, `activated_at` column is available ✅

### M2 implementation notes
- Migration: `auto_cancel_unactivated_reservations()` DB function + pg_cron job (or Supabase Edge Function if pg_cron unavailable on Cloud tier)
- Logic: `UPDATE reservations SET status='no_show' WHERE status='pending' AND activated_at IS NULL AND (date + start_time) < now() - interval '20 minutes'`
- **No app code changes needed** — pure DB/infra change
- Must confirm pg_cron availability on Supabase project before choosing implementation path
- Agent: `software-engineer` (backend only)

---

## Parallel work that can start immediately (do not need M2)
- **M3** (KIM-330 + KIM-338): Overlap restriction per user — `feat/overlap-restriction`
- **M5** (KIM-331 + KIM-340): Cancellation cutoff backend — `feat/cancellation-cutoff`
- **M8** (KIM-332 + KIM-343): Events data model — `feat/events-schema`
- **M10** (KIM-322 + KIM-323): Auth hardening — `feat/auth-hardening`

---

## Execution plan reference
Full plan with all 39 issues, milestones, agents, skills, and dependency graph:
→ `docs/ALEA-EXECUTION-PLAN.md`

## Linear project
→ https://linear.app/kimox-studio/project/alea-a9a47d8b2bb2/issues

---

## How to use this file

**At session start:**
1. Read `docs/HANDOFF.md` (this file) — mandatory before any action
2. Check `gh pr list --state open` for any PRs awaiting merge
3. Check `git branch --show-current` — should be on `develop`
4. Start from "Next milestone to execute" above

**At session end:**
1. Update this file with current state before closing
2. Save a memory entry summarising the session
3. Ensure all worktrees are pruned: `git worktree prune && rm -rf .claude/worktrees/`
