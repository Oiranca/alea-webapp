# Session Handoff

> Update this file at the end of every work session before closing the coding session.
> The next session must read this file first before doing anything.
> This file is the only valid handoff source for the repo. Do not use GitHub PR comments or `CLAUDE.md` for session handoff state.

---

## Last updated: 2026-04-15

## Current branch
`feat/KIM-386-database-time-drift`

## Open PRs — awaiting merge
| PR | Branch | Status |
|---|---|---|
| None | — | —

## Merged this session
| PR | Branch | Fix |
|---|---|---|
| #110 | `feat/KIM-379-password-recovery` | `KIM-379` merged into `develop`: admin-mediated password recovery, stale-session auth redirects, and root entry redirect hardening |
| #109 | `feat/KIM-378-member-activation` | `KIM-378` merged into `develop`: activation flow, login-first entry route, and auth redirect fixes |

---

## Status Summary

Active work moved to `KIM-386` on branch `feat/KIM-386-database-time-drift`.
Investigation found two root causes to fix first:
- persisted sensitive timestamps such as `psw_changed`, `active_from`, `used_at`, and `activated_at` were being stamped from app runtime instead of DB time
- reservation/check-in/cutoff logic mixed club-local business time with UTC/system-time helpers

Current implementation status:
- `develop` was fast-forwarded after merge of PR `#110`
- `docs/HANDOFF.md` and `docs/PLAN.md` were refreshed for the post-`KIM-379` roadmap
- a minimal robust `KIM-386` pass is in progress:
  - added a DB-backed time helper for persisted timestamps
  - switched auth/check-in critical writes to DB time
  - replaced `toISOString().split('T')[0]` / date-only parsing in the most sensitive reservation flows
  - added a SQL migration so reservation cron comparisons use explicit club timezone semantics

Current meaningful next steps:
- review current diff and decide whether to keep the `KIM-386` fix scoped exactly to persisted timestamps + reservation timezone boundaries
- if scope stays as-is, run broader validation (`pnpm lint`, `pnpm build`) and open the PR

Plan source:
- Use only `docs/PLAN.md`.
- Ignore removed legacy planning docs and canceled legacy tickets.

---

## Manual QA pending

All checks require a live browser session.

### PR #82 — Cancellation cutoff UI
- [ ] Cancel a reservation < 60 min away → cutoff error shown in red
- [ ] Dismiss dialog → error clears on reopen

### PR #86 — Check-in hardening
- [ ] Valid QR scan → reservation activates to `active`
- [ ] `/en/check-in/not-a-uuid` → redirects to `/en/rooms`
- [ ] `/xx/check-in/<valid-uuid>` (invalid locale) → redirects to `/`

### PR #101 — Admin force-delete events
- [ ] Admin deletes event with active/pending reservations → reservations cancelled, event removed
- [ ] Delete error displays in active locale (ES or EN)

### PR #103 — Slot end_time inclusive
- [ ] User A has 17:00–18:00 → User B sees both 17:00 and 18:00 as unavailable
- [ ] 19:00 remains green

### PR #104 — Check-in timezone fix
- [ ] Check-in at exact reservation start time → succeeds
- [ ] Check-in 5 min before start → succeeds
- [ ] Check-in 6 min before start → "too early" error

### PR #105 — Availability polling
- [ ] User A opens reservation dialog → User B books same table/date → within 30s slot appears red in User A's open dialog

### PR #106 — Event create/update cancels reservations
- [ ] Admin creates event for a room with active/pending reservations in same time window → reservations cancelled immediately
- [ ] Admin updates event time range to overlap existing reservations → overlapping reservations cancelled
- [ ] Admin updates event room assignment → only new room's reservations cancelled (old room unaffected)
- [ ] Admin updates only event title/description → no reservations cancelled

---

## Active roadmap reference

- `KIM-378` — Pre-registered activation flow
- `KIM-379` — Admin-mediated password recovery
- `KIM-386` — Investigate and fix database time drift versus system time
- `KIM-380` — Equipment inventory model
- `KIM-381` — Equipment-aware reservation flow
- `KIM-382` — 60-minute QR activation window
- `KIM-383` — Expanded event scheduling and blocking
- `KIM-317` — 24h booking times with 30-minute intervals
- `KIM-384` — Saved Game reservation type
- `KIM-385` — FAQ route

---

## Execution plan reference
→ `docs/PLAN.md`

## Linear project
→ https://linear.app/kimox-studio/project/alea-a9a47d8b2bb2/issues

---

## How to use this file

**At session start:**
1. Read `docs/HANDOFF.md` (this file) — mandatory before any action
2. `gh pr list --state open` — check PRs awaiting merge
3. `git branch --show-current` — confirm you are on the branch referenced above
4. If operational closure is still pending, use the Manual QA checklist above
5. Otherwise continue `KIM-386` on the branch above

**At session end:**
1. Update this file with current state
2. Do not add handoff-only state to GitHub comments or `CLAUDE.md`
3. Prune worktrees if needed: `git worktree prune && rm -rf .claude/worktrees/`
