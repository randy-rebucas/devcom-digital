# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Marketing agencies and freelance marketers who manage marketing for multiple clients and want a toolkit that speeds up their own delivery work — not end-consumers, and not a single in-house brand team.

## Product Purpose

Devcom Digital Marketing Services sells subscription access to a suite of digital marketing tools (SEO/keyword research, social content scheduling, campaign analytics, ad creative generation) under one license key. A user registers, subscribes via PayPal, and is issued a personal license key that unlocks the tools dashboard. Success is a subscriber who can log in, see their license is active, and reach a working tool in a few clicks.

## Positioning

One subscription, one login: instead of juggling separate accounts and bills for SEO, scheduling, analytics, and ad-copy tools, a single Devcom Digital subscription and license key unlocks all of them. The audience already knows and tolerates paying for point tools individually; the claim is consolidation and one bill, not a novel capability no other tool has.

## Operating Context

- Public marketing pages (home, pricing) are the conversion surface for agencies/freelancers evaluating the subscription.
- Registration → email verification → login is required before any paid action.
- Subscribing happens through an embedded PayPal subscription button; on approval the backend activates a subscription and issues a license key.
- The dashboard is the post-purchase home: subscription status and license key live there.
- The tools suite (`/tools`) is gated on an active subscription + active license; each tool has a status (in development vs. available), a markdown description, and optional download/guide links, all managed by admins.
- An admin area manages the tool catalog (create/edit/enable/disable/delete) and user roles.

## Capabilities and Constraints

- Auth: NextAuth credentials-based login, email verification required before sign-in.
- Billing: PayPal subscriptions only (recurring), no other payment method at present.
- License model: one license key per user, tied 1:1 to subscription status; a tool can further require the key to "activate" client-side (not yet specified how).
- Tools are dynamic, admin-authored content (name, slug, markdown description, status, image, download/guide URLs) — the redesign must render arbitrary/variable-length tool content well, not just the four example tools shown on the current marketing copy (SEO & Keyword Toolkit, Social Content Scheduler, Campaign Analytics, Ad Creative Generator).
- Roles: MEMBER and ADMIN; admin screens are a real, ongoing-use back office, not a marketing surface.

## Brand Commitments

None. The name "Devcom Digital Marketing Services" (short form "Devcom Digital") is fixed; visual identity (color, type, logo treatment, imagery) is fully open for this redesign.

## Evidence on Hand

No real customer logos, testimonials, case studies, or usage data exist. The four "what's inside the suite" feature blurbs on the current homepage are illustrative copy, not confirmed real tool names — actual tools are whatever exists in the admin-managed catalog at any time. Do not fabricate customer proof, logos, or metrics; if the redesign wants a "trusted by" or metrics moment, flag it as needing real evidence rather than inventing it.

## Product Principles

1. Consolidation is the whole pitch — the design should make "everything in one place, one key" legible at a glance, not bury it under generic SaaS marketing patterns.
2. Speaks to professionals who bill for their time — favor a credible, efficient, tool-literate tone over consumer-friendly softness; this is bought by people evaluating whether it saves them hours, not delighted by mascots.
3. The tool catalog is dynamic and admin-authored — every tools-related layout must hold up with 1 tool or 20, short or long descriptions, missing images, and both statuses (in development / available).
4. Post-purchase experience (dashboard, license key, tools access) is used repeatedly and functionally — treat it with Operate-mode discipline even while the marketing pages get full Persuade-mode ambition.

## Accessibility & Inclusion

No product-specific requirement established beyond standard web accessibility practice.
