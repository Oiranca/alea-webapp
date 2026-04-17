# Login Layout Redesign Plan

**Last updated:** 2026-04-17  
**Branch:** `docs/login-layout-redesign-plan`  
**Scope:** Login page layout redesign plan  
**Constraint:** Preserve Alea's dark visual identity

---

## Objective

Redesign the login layout so it feels more intentional, atmospheric, and product-specific while keeping the existing dark Alea theme.

The login experience should move away from a generic centered-card pattern and become a stronger entry point into the product world without slowing down the primary task: signing in quickly.

---

## Design Intent

The login page should feel like a threshold into Alea.

Desired qualities:

- dark
- sober
- atmospheric
- readable
- stable
- unmistakably part of the Alea universe

This is not a decorative fantasy poster. It is a controlled, dark fantasy access surface with a stronger sense of composition, materiality, and hierarchy.

---

## Current Problems

### 1. The current composition is too generic

The page is essentially:

- small icon row
- title
- subtitle
- centered card with form

It works, but it does not create a memorable entry experience.

### 2. Theme is carried by surface-level decoration

The current screen relies on:

- decorative icons
- gradient heading treatment
- standard centered card layout

This makes the screen feel themed, but not deeply designed.

### 3. Desktop space is underused

The current layout does not take advantage of larger screens to build atmosphere, narrative, or spatial hierarchy.

### 4. The form panel lacks distinct material presence

The login form is functional, but the container does not feel refined enough to serve as the main visual anchor of the page.

### 5. The page does not fully balance atmosphere and efficiency

The login should feel immersive without becoming noisy. Right now it is simple, but not especially distinctive.

---

## Product Constraints

- Keep dark theme.
- Keep login flow behavior unchanged.
- Keep the page fast to scan and easy to use.
- Maintain WCAG 2.2 AA expectations.
- Preserve responsive quality on mobile and desktop.
- Avoid decorative excess that competes with the form.

---

## Visual Direction

### Core concept

Design the login as a dark ceremonial access point.

The mood should feel closer to:

- a gatehouse
- an archive entrance
- a chamber of entry

than to:

- a marketing hero
- a generic app auth screen
- a fantasy poster

### Tone

Use restrained dark fantasy:

- deep charcoal and ember-tinted neutrals
- controlled copper or warm-gold accents
- subtle texture, depth, and framing
- no gradient text
- no decorative icon stack as the main identity device

---

## Redesign Goals

1. Give the login page a stronger visual identity within Alea.
2. Improve page-level composition, especially on desktop.
3. Make the form panel feel more intentional and premium.
4. Strengthen typographic hierarchy and spatial rhythm.
5. Keep the login action visually dominant and frictionless.

---

## Workstreams

## 1. Page Composition

### Goal

Replace the current centered card layout with a more designed composition.

### Proposed direction

- use a two-zone layout on desktop
- reserve one side for brand atmosphere and context
- reserve one side for the sign-in panel
- collapse cleanly to a single-column flow on mobile

### Deliverable

A responsive login shell with:

- stronger desktop presence
- cleaner mobile prioritization
- better page balance

---

## 2. Hero and Identity Layer

### Goal

Create a stronger sense of place without turning the login into a marketing page.

### Changes

- remove reliance on the current icon row
- replace gradient headline styling with solid, controlled type treatment
- add a subtle narrative or atmospheric layer through composition, not ornament spam
- improve the relationship between title, subtitle, and supporting copy

### Deliverable

A more distinctive identity block that feels like Alea, not a templated auth header.

---

## 3. Form Panel Redesign

### Goal

Make the login panel feel like the core object on the page.

### Changes

- redesign the panel surface and structure
- refine spacing and density
- improve alignment of labels, fields, error state, help text, and submit action
- give the main button stronger presence and better visual weight

### Deliverable

A form container with stronger visual authority and cleaner internal rhythm.

---

## 4. Interaction and State Design

### Goal

Improve the perceived quality of the login interaction without changing the flow.

### Changes

- refine focus states
- refine loading state composition
- integrate server error styling into the page language
- improve recovery-help disclosure so it feels deliberate rather than leftover

### Deliverable

More polished states for:

- idle
- focus
- submit loading
- validation error
- server error
- password recovery help

---

## 5. Background and Atmosphere

### Goal

Build depth behind the layout without relying on blur-heavy or trendy effects.

### Changes

- add controlled background layering
- use subtle texture, vignette, geometry, or heraldic framing only if they support the composition
- keep the background subordinate to the form

### Deliverable

A dark backdrop with depth and mood, but no visual clutter.

---

## 6. Responsive and Accessibility Validation

### Goal

Ensure the redesign is strong across viewport sizes and remains fully usable.

### Checks

- mobile-first reading order
- strong focus visibility
- contrast compliance
- stable field sizing and spacing
- no loss of clarity on smaller screens

### Deliverable

A login layout that remains coherent and fast across mobile, tablet, and desktop.

---

## Execution Phases

### Phase 1. Direction Lock

- confirm composition approach
- define the visual metaphor
- define the allowed fantasy language for the page

**Output:** approved layout direction

### Phase 2. Shell Redesign

- rebuild page composition
- establish desktop and mobile layout behavior
- define background and atmosphere layer

**Output:** redesigned page shell

### Phase 3. Form Panel Redesign

- redesign the sign-in panel
- improve hierarchy, spacing, and button presence
- refine supporting help copy placement

**Output:** final form layout

### Phase 4. State and Polish Pass

- refine errors, loading, and recovery help
- check contrast, spacing, and responsive edge cases
- remove any remaining generic auth-screen patterns

**Output:** implementation-ready visual standard

---

## Success Criteria

The redesign is successful if:

- the page feels clearly more specific to Alea
- the login form remains the dominant action surface
- the layout feels stronger on desktop without becoming busy
- the dark theme feels more mature and less templated
- mobile remains clear, direct, and efficient

---

## Non-Goals

- changing auth logic
- redesigning activation or recovery flows in this phase
- turning login into a marketing landing page
- introducing visual effects that distract from sign-in

---

## Recommended Next Step

If implementation starts later, begin with:

1. page shell and responsive composition
2. identity block redesign
3. form panel redesign
4. state and polish pass

This order keeps the visual foundation stable before touching detailed form presentation.
