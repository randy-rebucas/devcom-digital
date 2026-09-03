---
name: Devcom Digital Marketing Services
description: An agency award-shelf identity for a one-subscription, one-license-key marketing tools suite.
colors:
  ink: "#15120e"
  ink-raised: "#1c1812"
  paper: "#f2ece1"
  paper-dim: "#a89e8c"
  hairline: "#3a3226"
  gold: "#c9973f"
  gold-bright: "#e3b563"
  gold-dim: "#6b5730"
typography:
  display:
    fontFamily: "Syne, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.05em"
  mono:
    fontFamily: "Space Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    fontFeature: "tabular-nums"
rounded:
  sm: "0.125rem"
  pill: "999px"
spacing:
  section-y: "4rem"
  section-y-lg: "5rem"
  container-x: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.gold-bright}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-secondary-hover:
    textColor: "{colors.gold-bright}"
  input:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  badge:
    backgroundColor: "transparent"
    textColor: "{colors.paper-dim}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# Design System: Devcom Digital Marketing Services

## Overview

**Creative North Star: "The Trophy Room"**

The suite is presented as a curated shelf of entries worth walking into, not a generic SaaS feature grid. A warm charcoal ground and a single committed brass/gold accent do the work that a multi-color palette would do elsewhere: gold is rare, and its rarity is what makes it read as an award rather than decoration. The site refuses boxed drop-shadow cards; instead, hairline rules divide space, and repeating collections (the tool suite, admin overview cards) share border lines in a grid so that no single item gets its own frame — everyone stands on the same shelf.

The type system pairs an oversized, confident display grotesk (Syne) for headlines with a workmanlike body sans (Plus Jakarta Sans) and a tabular monospace (Space Mono) reserved specifically for counted, priced, or keyed values — price, tool index numbers, step numbers, the license key itself. This is a deliberate signal: numbers that matter to a billing, licensing product get a distinct, precise typographic register from prose.

A single state grammar — lit vs. dormant — carries every "is this on" question in the product: subscription status, license validity, tool availability. It is never a soft rounded badge alone; it is always a dot (filled and glowing when lit, hollow and dim when dormant) paired with text that shifts color with it. This grammar is threaded identically from the public marketing pages through the authenticated dashboard and tools area.

**Key Characteristics:**
- Warm charcoal ground, one committed gold accent, no second hue
- Hairline-rule "lattice" grids instead of boxed/shadowed cards
- Syne display headlines, Plus Jakarta Sans body, Space Mono for all tabular/counted/keyed values
- Lit-vs-dormant status grammar (glow + bright text / hollow ring + dim text), reused everywhere status appears
- Flat by default; no resting-state shadows

## Colors

A near-monochrome charcoal-and-parchment field with one committed brass/gold accent; there is no secondary hue anywhere in the shipped UI.

### Primary
- **Gold** (`#c9973f`): the one committed accent. Primary button fills, active link/heading emphasis (the "One credential" span on the homepage headline), wordmark's second word, price emphasis, download CTAs.
- **Gold Bright** (`#e3b563`): the hover/lit state of gold — button hover fill, link hover text, lit status-dot fill and its glow, focused-field border.
- **Gold Dim** (`#6b5730`): the muted, dormant register of the accent — tool index numerals ("No. 01"), step numerals, dormant status-dot ring color source, scrollbar-thumb hover.

### Neutral
- **Ink** (`#15120e`): warm near-black page ground (`body` background), and the base fill for inputs/selects.
- **Ink Raised** (`#1c1812`): one step up from ink — hover fill for lattice-grid entry rows, panel backgrounds (license-key box, admin dropdown, mobile nav panel, "not configured" notices).
- **Paper** (`#f2ece1`): warm off-white primary text and headline color. Never pure white.
- **Paper Dim** (`#a89e8c`): secondary/muted text — body copy, field labels, nav links at rest, dormant status labels. A warm-tinted gray, not a neutral gray.
- **Hairline** (`#3a3226`): the section-divider and border color used everywhere a rule, card edge, or field stroke is needed.

### Named Rules
**The One Accent Rule.** Gold is the only chromatic color in the system (outside the `danger` button variant's default Tailwind red, used solely for destructive admin actions). Every other value is charcoal, parchment, or a tint between them. A second accent hue would break the "one credential, one light" metaphor the palette exists to support.

**The Lit/Dormant Rule.** Any binary "is this active" state — subscription status, license validity, tool availability — renders as a status dot (filled + glowing gold-bright when lit, hollow ring + `paper-dim` at 0.6 opacity when dormant) paired with text that shifts from `gold-bright`/`font-medium` to `paper-dim`. Never a rounded badge alone; see `src/components/ui/status-indicator.tsx`.

## Typography

**Display Font:** Syne (weights 600/700/800), with sans-serif fallback
**Body Font:** Plus Jakarta Sans (weights 400/500/600/700), with sans-serif fallback
**Label/Mono Font:** Space Mono (weights 400/700), with monospace fallback

**Character:** An oversized, geometric display face carries headline weight and confidence; a plain, legible body sans stays out of the way; a monospace is reserved exclusively for numbers that mean something countable, priced, or secret.

### Hierarchy
- **Display / Hero** (700, `text-5xl` → `text-7xl` responsive, `leading-[1.05]`, `tracking-tight`): the homepage headline only.
- **Headline** (700, `text-2xl` → `text-3xl`, `tracking-tight`): section headings (`The suite`, `How access works`) and page titles (`Your dashboard`, `Tools suite`, `Admin`).
- **Title** (700, `text-xl`, `tracking-tight`): individual entry titles inside lattice-grid cells (tool name, admin card label context).
- **Body** (400, `text-sm`–`text-lg`, `leading-relaxed`, color `paper-dim`): descriptive copy, step descriptions, markdown tool descriptions.
- **Label** (600, `text-xs`, `uppercase`, `tracking-wide`, color `paper-dim`): functional micro-headings only — form field labels and section-group headings inside stacked hairline lists (`Subscription`, `License key`, `Download`, `Guide`). Not used as decorative copy above a headline.
- **Mono / Tabular** (400–700, `font-mono`, `tabular-nums`): price (`$29`), tool index numerals (`No. 01`), onboarding step numbers (`01`/`02`/`03`), the license key, admin count values, tool counts.

### Named Rules
**The Countable-Numbers Rule.** Any number the user counts, is billed, or must copy exactly (price, tool index, step number, license key, admin counts) renders in `font-mono` with `tabular-nums`. Prose numbers stay in the body font.

## Layout

Marketing surfaces use a `max-w-6xl` container; single-focus authenticated surfaces (dashboard, tools list, tool detail) use narrower containers (`max-w-4xl`, `max-w-2xl`, `max-w-md`) matched to content density. Horizontal page padding is constant at `px-6`. Section rhythm is generous vertical padding (`py-16`–`py-28`) with a `border-t border-hairline` marking the seam between sections — the hairline rule is the section divider, not whitespace alone.

Two variants of the same "shared hairline, no boxed cards" principle recur:
- **Lattice grid** (`grid grid-cols-1 sm:grid-cols-2`, container carries `border-l border-t border-hairline`, each cell carries `border-b border-r border-hairline`): used for the tool suite listing (home and `/tools`) and the admin overview cards. Adjacent cells share a single border line instead of each getting an individually boxed, shadowed card.
- **Stacked hairline list** (`border-t border-hairline` wrapper, each child section `border-b border-hairline`): the single-column equivalent for sequential content blocks — dashboard's Subscription/License key/Tools sections, tool-detail's Download/Guide sections.

## Elevation & Depth

Flat by default. No resting-state box-shadows on buttons, inputs, badges, or lattice-grid cells; depth and separation are conveyed by the `hairline` border color and by an `ink` → `ink-raised` background shift on hover, not by shadow. The one shipped exception is the mobile-nav dropdown panel, which uses a default Tailwind `shadow-lg` because it is a transient overlay floating above page content, not a resting surface — this does not extend to any at-rest component.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. The only shadow in the system belongs to the mobile navigation's floating overlay panel; it is not a general-purpose elevation token.

## Shapes

A single small corner radius (`rounded-sm`, ~2px) is used everywhere a radius appears at all: buttons, inputs/selects, badges, tool images, code chips, the license-key panel. Status dots and the scrollbar thumb are the only fully round (`999px`/pill) shapes in the system — reserved for the lit/dormant status grammar and the scrollbar, not for buttons or badges. Borders are uniformly 1px `hairline`, with `gold-bright` substituted on focus (inputs) or hover (secondary button, tool images stay hairline).

## Components

### Buttons
- **Shape:** small radius (`rounded-sm`, ~2px), consistent across all variants and sizes (`sm`/`md`/`lg`).
- **Primary:** solid `gold` fill, `ink` text, `font-semibold`, `tracking-tight`; hover fills `gold-bright`.
- **Secondary:** transparent fill, `hairline` border, `paper` text; hover swaps border and text to `gold`/`gold-bright`.
- **Ghost:** no border or fill, `paper-dim` text; hover lightens to `paper`.
- **Danger:** text-only, default red (`red-400`/`red-300` on hover) — the sole non-gold color in the system, scoped to destructive admin actions.
- Disabled state: `opacity-50`, cursor disabled, hover suppressed.

### Badges
- **Style:** small rectangular chip, `hairline` border, `rounded-sm`, `paper-dim` uppercase text with wide tracking. Used for generic tags — distinct from the Status Indicator, which is the component for on/off state specifically.

### Cards / Containers (Lattice Grid)
- **Corner Style:** none — cells are unboxed, defined only by shared hairline borders (see Layout).
- **Background:** `ink`, shifting to `ink-raised` on hover.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px `hairline` shared between adjacent cells, not individually applied per card.
- **Internal Padding:** `p-6` (marketing/tools listing), `p-5` (admin overview).

### Inputs / Fields
- **Style:** `hairline` 1px border, `ink` background, `rounded-sm`, `paper` text, `paper-dim` placeholder at reduced opacity.
- **Focus:** border shifts to `gold-bright` (no glow/ring on the field itself; the page-level `:focus-visible` outline is reserved for non-field focusable elements).
- **Labels:** uppercase, `text-xs`, `font-semibold`, `tracking-wide`, `paper-dim` — always above the field, never inline as a kicker.

### Navigation
- **Style:** `border-b border-hairline` header, wordmark rendered as `DEVCOM` (paper) + `DIGITAL` (gold) with no separating mark. Nav links are `paper-dim`, hover to `gold-bright`; the sole filled CTA (`Get started`) uses the primary button treatment.
- **Mobile:** hamburger icon (inline SVG, not an icon font) reveals a full-width dropdown panel (`bg-ink`, `border-b border-hairline`, `shadow-lg` — the system's one shadow exception) with the same link treatment stacked vertically.

### Status Indicator (signature component)
The lit/dormant grammar in its literal form: a small dot plus a label, reused verbatim for subscription status (dashboard), license-gated access (dashboard, tools, tool detail), and tool availability (`ToolStatusBadge`, which wraps `StatusIndicator` keyed off a status→lit boolean map in `src/lib/tools.ts`).
- **Lit:** filled `gold-bright` dot with a two-layer glow (`color-mix` ring + soft blur), label in `gold-bright` `font-medium`.
- **Dormant:** hollow dot (`transparent` fill, 1.5px `paper-dim` ring, `opacity-0.6`), label in plain `paper-dim`.
- Any new on/off state in the product (a future integration status, a future plan tier) should reuse this component and its two states rather than inventing a third visual treatment.

## Do's and Don'ts

### Do:
- **Do** reserve `gold`/`gold-bright` as the only chromatic accent; keep everything else on the ink/paper/hairline scale.
- **Do** use the lattice-grid pattern (shared hairline borders, no per-cell shadow or individual frame) for any repeating collection of entries.
- **Do** render every on/off product state through `StatusIndicator`'s lit/dormant grammar rather than a new badge style.
- **Do** set `font-mono` + `tabular-nums` on any price, count, index number, or key the user might copy or compare.
- **Do** keep the uppercase `Label` typographic role scoped to functional field/section labels, not decorative copy.

### Don't:
- **Don't** add drop shadows to resting-state buttons, inputs, or lattice-grid cells — the system is flat by default; the mobile-nav overlay's `shadow-lg` is a scoped exception for floating menus, not a general elevation token.
- **Don't** introduce a second accent hue. The one-gold-accent constraint is what makes the "one credential" pitch legible; a second color competes with it.
- **Don't** box individual items in the lattice-grid pattern with their own border/shadow — the shared-hairline lattice is the point; a boxed card here would be reverting to the generic SaaS grid the direction explicitly rejects.
- **Don't** use kicker/eyebrow copy above headlines. No page in the shipped build uses one; the uppercase label style exists only for functional field and section-group labels.
