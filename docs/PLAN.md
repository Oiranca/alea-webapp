# Alea Plan

**Last updated:** 2026-04-15
**Source of truth:** current repository state + active Linear issues for project `Alea`
**Ignore:** canceled legacy tickets and removed migration-era planning docs

---

## Current Product State

- Stack: single Next.js 15 app with Supabase, `next-intl`, Vitest, and shadcn/ui.
- Member import is done and merged (`KIM-377`).
- Admin already has: users, reservations, rooms, events, and member import.
- `KIM-378` is merged: public sign-up is disabled, activation links are admin-issued, and login is the default entry route.
- Current reservation model supports normal table bookings, QR check-in, no-show tracking, and event blocking, but does not yet support equipment bookings or `Saved Game`.

---

## Open Issues In Scope

### High priority

- `KIM-379` — New password policy + admin-mediated password recovery links
- `KIM-386` — Investigate and fix database time drift versus system time
- `KIM-380` — Equipment inventory model + room defaults + single QR for double tables
- `KIM-381` — Reservation flow with optional equipment + overlap validation + one-week booking window
- `KIM-382` — QR activation window up to 60 minutes after reservation start
- `KIM-383` — Multi-day / multi-room event management with reservation overrides

### Medium priority

- `KIM-317` — 24h reservation times with 30-minute intervals
- `KIM-384` — `Saved Game` reservation type
- `KIM-385` — Public FAQ route

---

## Execution Order

### Phase 0 — Stabilize current merged work

1. Close the pending manual QA checklist for merged work.
2. Refresh docs only after the product state is confirmed in `develop`.
3. Start new implementation work only after deciding how strictly to enforce the remaining manual QA gate.

Reason:
- No new feature plan should sit on top of unverified behavior in reservations/events/check-in.

### Phase 1 — Lock the new access model

1. `KIM-379`

Reason:
- `KIM-377` created the imported member base.
- `KIM-378` already turned that imported base into the real access model.
- `KIM-379` completes the same auth transition with the recovery flow and final password rules.
- The auth transition should be completed before user-facing FAQ or deeper booking changes.

### Phase 2 — Prepare inventory for equipment-aware bookings

1. `KIM-386`
2. `KIM-380`

Reason:
- Time correctness is cross-cutting infrastructure for reservations, check-in, auth timestamps, and event rules.
- The database/system time mismatch should be corrected before continuing deeper time-sensitive booking work.
- Equipment cannot be reserved cleanly until it exists as a first-class admin-managed resource.
- The single-QR rule for double tables also affects later saved-game and booking behavior.

### Phase 3 — Upgrade the normal reservation flow

1. `KIM-381`
2. `KIM-382`
3. `KIM-317`

Reason:
- `KIM-381` depends on the equipment inventory from `KIM-380`.
- `KIM-382` is independent enough to run near this phase, but it still belongs to the reservation rules layer.
- `KIM-317` is also a reservation-flow change and should be validated against the new overlap/equipment behavior rather than implemented against an old flow and then reworked.

### Phase 4 — Expand event authority

1. `KIM-383`

Reason:
- This extends a feature that already exists in the repo.
- It must be aligned with normal reservation behavior from Phase 3.
- It should land before `Saved Game`, because `KIM-384` explicitly depends on event blocking semantics.

### Phase 5 — Add the new saved-game product

1. `KIM-384`

Reason:
- `Saved Game` depends on stable inventory, booking, QR attendance, and event-blocking rules.
- It is the most cross-cutting open feature and should not be started before the lower-level rules are settled.

### Phase 6 — Publish user-facing documentation

1. `KIM-385`

Reason:
- The FAQ must describe the final implemented rules, not transitional behavior.
- It should land after auth, equipment, booking, event, and saved-game flows are stable.

---

## Dependency Summary

- `KIM-378` -> `KIM-379`
- `KIM-386` -> `KIM-381` + `KIM-382` + `KIM-383`
- `KIM-380` -> `KIM-381`
- `KIM-381` + `KIM-382` + `KIM-383` -> `KIM-384`
- `KIM-378` + `KIM-379` + `KIM-381` + `KIM-382` + `KIM-384` -> `KIM-385`
- `KIM-317` is technically independent, but should be validated after the reservation flow changes in `KIM-381`

---

## Recommended Next Build Step

If the goal is implementation work after docs cleanup, the next branch should target:

1. the pending manual QA checklist if we are finishing operational closure
2. otherwise `KIM-386` from a fresh branch off `develop`

---

## Notes

- Do not reintroduce milestone plans from the old migration era.
- Do not use canceled child tickets as active roadmap items when a newer parent issue supersedes them.
- Keep `docs/HANDOFF.md` short and aligned with this file.
