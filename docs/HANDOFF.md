# Session Handoff

> Update this file at the end of every work session before closing the coding session.
> The next session must read this file first before doing anything.
> This file is the only valid handoff source for the repo. Do not use GitHub PR comments or `CLAUDE.md` for session handoff state.

---

## Last updated: 2026-04-15

## Current branch
`feat/KIM-378-member-activation`

## Open PRs — awaiting merge
| PR | Branch | Status |
|---|---|---|
| #109 | `feat/KIM-378-member-activation` | Open — local QA/review passed; merge still gated by pending manual QA checklist |

## Merged this session
| PR | Branch | Fix |
|---|---|---|
| None | — | — |

---

## Status Summary

`develop` already includes `KIM-377` and merged PR `#106`.
Current branch implements `KIM-378`: public sign-up removed, login becomes primary entry route, admin copy-link activation flow added, and first-time activation now sets password + activates the imported member profile.

Current meaningful next steps:
- Finish the pending manual QA checklist still listed below.
- Merge PR `#109` once the manual QA gate is considered closed.
- Start `KIM-379` next after `KIM-378` lands.

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
5. Otherwise continue `KIM-378` on this branch, or start `KIM-379` if `KIM-378` is already merged

**At session end:**
1. Update this file with current state
2. Do not add handoff-only state to GitHub comments or `CLAUDE.md`
3. Prune worktrees if needed: `git worktree prune && rm -rf .claude/worktrees/`
