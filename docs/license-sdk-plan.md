# License Key SDK — Analysis & Implementation Plan

## 1. Current implementation (as of this analysis)

**Where the license lives:** `prisma/schema.prisma` — `License` model, 1:1 with `User`:
- `key` (unique, format `DEVCOM-XXXX-XXXX-XXXX-XXXX`, generated in [src/lib/license.ts](../src/lib/license.ts))
- `active` boolean, `revokedAt`
- Issued/revoked by [issueLicenseForUser / revokeLicenseForUser](../src/lib/license.ts), called from the PayPal webhook when a subscription activates/cancels.

**Where it's checked today:** only *inside this app*, and only in one place —
[src/app/api/tools/[slug]/download/route.ts](../src/app/api/tools/[slug]/download/route.ts) does a direct Prisma lookup (`subscription.status === "ACTIVE" && license.active`) before incrementing a download counter. That's a same-process DB read, not a verifiable credential check.

**Where it's shown to the user:** [src/components/license-key-reveal.tsx](../src/components/license-key-reveal.tsx) — a masked/reveal widget on the dashboard. Purely presentational; doesn't validate anything.

**The gap:** `Tool.requiresLicenseKey` exists on the `Tool` model (`prisma/schema.prisma:123`) but **nothing reads it**. Per [PRODUCT.md](../PRODUCT.md), the suite tools (SEO/keyword research, social scheduler, campaign analytics, ad creative generator) are separate offerings a subscriber unlocks with *one* license key — but there is currently no mechanism for a tool that isn't this Next.js app itself to check whether a given key is valid. If those tools are (or will be) separate codebases/deployments, they have no way to gate access.

This is what "install an SDK on all tools" solves: a small package each tool integrates to verify a Devcom license key against this app, without every tool reimplementing Prisma/DB access or trusting the client.

## 2. What needs to exist first: a verification API on devcom-digital

The SDK is a thin client — it needs a real endpoint to call. None exists yet. Proposed:

```
POST /api/license/verify
Body: { key: string, toolSlug?: string }
Response 200: { valid: true, status: "ACTIVE", userId, expiresAt }
Response 200: { valid: false, reason: "revoked" | "not_found" | "subscription_inactive" }
```

Design notes:
- Server-to-server only (no cookies/session) — auth via a per-tool API key or HMAC signature, since any tool's backend calls this, not a browser.
- Rate-limit by key/IP; log verification attempts for abuse detection.
- Should NOT leak license keys to the client to re-check directly — verification stays server-side in each tool's backend.
- Consider an optional `POST /api/license/heartbeat` for periodic re-checks in long-running tool sessions, and caching guidance (SDK should cache a "valid" result briefly, e.g. 5–15 min, to avoid hammering this endpoint).

## 3. SDK shape

Package: `@devcom/license-sdk` (Node/TS, works in any backend — the tools don't have to be Next.js).

```ts
import { DevcomLicense } from "@devcom/license-sdk";

const license = new DevcomLicense({
  apiKey: process.env.DEVCOM_TOOL_API_KEY, // issued per-tool in the admin area
  toolSlug: "seo-keyword-toolkit",
});

const result = await license.verify(userSuppliedKey);
if (!result.valid) {
  // 403 / show "subscription required"
}
```

Requirements:
- Zero DB/Prisma dependency — pure HTTP client against `/api/license/verify`.
- Built-in short-lived cache (in-memory, pluggable) to avoid a network round trip on every request.
- Typed responses, clear error reasons (`not_found`, `revoked`, `subscription_inactive`, `network_error`).
- Fails closed by default (network error → treat as invalid) with an explicit opt-in `failOpen` flag for tools that can't tolerate an outage blocking them.
- Framework-agnostic core + optional thin Express/Next.js middleware wrapper (`requireLicense()`).

## 4. Rollout plan

1. Add `POST /api/license/verify` (+ per-tool API key issuance in the admin area, reusing the existing admin/Tool CRUD screens).
2. Publish `@devcom/license-sdk` as a private npm package (or a git-installable package if no registry yet).
3. Wire the SDK into the download route ([download/route.ts](../src/app/api/tools/[slug]/download/route.ts)) itself first, replacing the direct Prisma check — dogfooding proves the contract before external tools depend on it.
4. Document integration steps for tool owners (README in the SDK repo): install, get API key from admin, call `verify()`, handle the three outcomes.
5. Roll out to each real tool as it comes online, gated by `Tool.requiresLicenseKey`.

## 5. Claude Code prompt — paste this to start implementation

```
Implement the license verification API and SDK described in docs/license-sdk-plan.md.

Phase 1 (this repo, devcom-digital):
- Add POST /api/license/verify per the contract in section 2 of the plan.
- Add a ToolApiKey model (or reuse an existing admin-managed secret) so each
  Tool can authenticate its verify requests; expose issuing/rotating it from
  the existing admin tools screens (src/app/admin/tools/).
- Replace the direct Prisma license/subscription check in
  src/app/api/tools/[slug]/download/route.ts with a call through the same
  verification logic the new endpoint uses, so there's one source of truth.
- Add tests for the verify endpoint: valid key, revoked key, inactive
  subscription, unknown key, wrong tool API key.

Phase 2 (new package):
- Scaffold @devcom/license-sdk as a standalone TypeScript package per
  section 3 of the plan: verify(), in-memory TTL cache, typed error reasons,
  fail-closed default with a failOpen option, and an optional Express/
  Next.js requireLicense() middleware helper.
- Write the package README covering: install, configuration (apiKey,
  toolSlug, base URL), verify() usage, and the middleware helper.

Ask before starting Phase 2 if Phase 1 reveals the API contract needs to
change — don't build the SDK against an endpoint shape that's still moving.
```
