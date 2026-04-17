# Admin Dashboard Improvement Plan

**Last updated:** 2026-04-17  
**Branch:** `docs/admin-dashboard-improvement-plan`  
**Scope:** Admin dashboard UX/UI improvement plan for Alea  
**Source of truth:** current repository state + persisted design context in `.impeccable.md`

---

## Objective

Improve the Alea admin dashboard so it feels operational first, visually cohesive, and faster to scan, while preserving the existing dark fantasy identity of the product.

This plan is not a feature roadmap. It is a redesign and systemization plan for the existing admin experience.

---

## Design Intent

The admin area should feel like:

- controlled
- legible
- stable
- efficient
- unmistakably part of Alea

The visual direction should remain dark fantasy, but in a restrained administrative form. The target is not a decorative dashboard and not a generic SaaS back office. It should feel like a disciplined operational console inside the same world as the public product.

---

## Current Problems

### 1. The dashboard shell is too decorative for an admin surface

The current top area behaves more like a themed landing header than an operational control surface. It adds atmosphere, but not enough structure or utility.

### 2. The four admin domains do not behave like one system

Users, reservations, rooms, and events each have their own local presentation logic and emphasis. The result is functional but visually fragmented.

### 3. Visual hierarchy is weaker than the operational hierarchy

The interface signals theme more strongly than state, urgency, or actionability. This slows scanning and reduces clarity during repetitive admin work.

### 4. Some UI patterns make the dashboard feel generic

Examples:

- centered tab navigation
- decorative glow treatments
- gradient text
- blur/glass utility styles
- nested bordered blocks and side-accent patterns

These details reduce the sense of precision and make the admin feel closer to a themed template than a production-grade control surface.

### 5. Data-dense workflows need tighter composition

The current admin sections are readable, but they can become more compact, more structured, and more decision-oriented without sacrificing accessibility.

---

## Product Constraints

- Keep the existing admin information architecture: users, reservations, rooms, events.
- Preserve the current dark fantasy product tone.
- Maintain WCAG 2.2 AA expectations.
- Do not reduce mobile usability.
- Do not introduce ornamental redesign choices that make data entry or scanning slower.
- Do not redesign the public site as part of this effort.

---

## Target Outcomes

By the end of this redesign, the admin should achieve:

- faster scanning of lists, tables, and statuses
- more consistent section structure across all admin domains
- clearer visual distinction between passive information and critical actions
- a more mature and controlled fantasy aesthetic
- a reusable admin design language that future features can follow

---

## Workstreams

## 1. Dashboard Shell

### Goal

Replace the current decorative page shell with an operational shell that establishes structure immediately.

### Changes

- simplify the top header into a compact control bar
- replace the current centered tab treatment with a more deliberate navigation pattern
- make all four admin areas feel equivalent in priority
- add room for lightweight contextual summary if needed, but avoid hero-style metrics

### Deliverable

A new admin shell component that defines:

- page title treatment
- section navigation
- spacing rhythm
- responsive behavior

---

## 2. Admin Visual System

### Goal

Create a dedicated admin visual language inside Alea's existing theme.

### Changes

- reduce glow, blur, and promotional accents
- remove gradient text from admin-facing headings
- tighten the color system around darker surfaces, copper accents, and controlled semantic states
- replace generic typography pairings with a stronger admin-specific hierarchy
- define clear rules for borders, surfaces, density, and interaction states

### Deliverable

A documented set of admin design tokens or conventions covering:

- headings
- body text
- surfaces
- borders
- semantic colors
- focus and hover states

---

## 3. Section Pattern Unification

### Goal

Make every admin section follow the same structural grammar.

### Changes

- standardize section headers
- standardize placement of filters and actions
- standardize empty, loading, error, and success states
- standardize content containers and density rules

### Deliverable

A shared section blueprint that all admin modules use:

- header row
- support text
- primary action area
- filter area
- content body
- feedback/state region

---

## 4. Users Management Redesign

### Goal

Make the users area feel like a high-clarity operations panel.

### Changes

- strengthen search and action proximity
- clarify the difference between edit, activation, recovery, and delete actions
- improve table/list scanability for role, active state, and identity
- integrate import entry more cleanly into the control layer

### Deliverable

A redesigned users section with:

- stronger filtering and action layout
- cleaner row hierarchy
- clearer user state communication
- less visual competition between controls

---

## 5. Reservations Management Redesign

### Goal

Turn reservations into the most scannable operational surface in the admin.

### Changes

- prioritize status readability over decoration
- improve date/time and table grouping readability
- make destructive actions feel intentional and unmistakable
- consider sorting, grouping, or emphasis patterns for operationally sensitive statuses

### Deliverable

A redesigned reservations table or list that improves:

- scan speed
- action confidence
- status recognition
- cross-device readability

---

## 6. Rooms and Tables Redesign

### Goal

Make room and table management feel like inventory control rather than nested themed cards.

### Changes

- reduce accordion-like visual noise
- remove side-stripe nesting patterns
- improve room summary readability
- present tables and QR actions in a tighter, more system-like layout
- improve the create-table flow so it feels integrated rather than appended

### Deliverable

A redesigned rooms experience with:

- stronger inventory structure
- cleaner expansion behavior
- better QR management presentation
- less layered visual chrome

---

## 7. Events Section Alignment

### Goal

Bring events into the same design system as the other admin areas.

### Changes

- align section shell, actions, filters, and feedback with the new admin standard
- ensure visual parity with users, reservations, and rooms

### Deliverable

An events section that no longer feels like a separate UI dialect.

---

## Execution Phases

### Phase 1. Audit and Direction Lock

- inventory current admin patterns
- identify reusable vs replaceable pieces
- define the admin aesthetic direction in concrete terms
- decide navigation approach for the shell

**Output:** approved direction and component strategy

### Phase 2. Build the Shell and System

- redesign the top-level admin wrapper
- define typography, spacing, surface, and state rules
- create reusable admin section primitives

**Output:** foundation ready for section migration

### Phase 3. Migrate High-Impact Sections

- redesign users
- redesign reservations

**Output:** the two most operationally heavy sections moved to the new system

### Phase 4. Migrate Structural Sections

- redesign rooms
- align events

**Output:** full admin consistency across all current modules

### Phase 5. Polish and Validation

- accessibility pass
- density and responsiveness pass
- interaction consistency pass
- visual cleanup and copy tightening

**Output:** production-ready admin UI standard

---

## Prioritization

If this work must be split into the smallest meaningful milestones, use this order:

1. admin shell and navigation
2. admin visual system and section blueprint
3. users redesign
4. reservations redesign
5. rooms redesign
6. events alignment
7. final polish and accessibility validation

---

## Success Criteria

The redesign is successful if:

- an admin can move between sections with less orientation overhead
- section layouts feel related and predictable
- critical states are easier to spot than decorative elements
- the interface preserves Alea's fantasy identity without feeling theatrical
- future admin features can be added without inventing new local patterns

---

## Non-Goals

- redesigning the public reservation flow
- changing backend behavior or business rules
- adding new product features unrelated to the current admin surface
- turning the admin into a generic enterprise dashboard

---

## Recommended Next Step

Start with a shell-first redesign branch that covers:

1. admin page wrapper
2. admin navigation pattern
3. section header blueprint
4. shared visual rules for data-heavy admin surfaces

This creates the foundation required to redesign each section without fragmentation.
