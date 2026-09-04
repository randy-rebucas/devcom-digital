# @devcomdigital/license-sdk

Server-side client for verifying a Devcom Digital subscriber's license key from
any tool in the suite (SEO/keyword research, social scheduler, campaign
analytics, ad creative generator, or anything added later).

It talks to `POST /api/license/verify` on the main Devcom Digital app — see
[docs/license-sdk-plan.md](../../docs/license-sdk-plan.md) in the repo root
for the full design and rollout plan.

**Never use this from the browser.** The API key identifies your tool to
Devcom's backend; keep it server-side (env var), and only call `verify()`
from your own backend after receiving a license key from your user.

Ships as both CommonJS and ESM with bundled type declarations, so it works
the same from a plain `require()` Node script, a `"type": "module"` /
ESM project, or a TypeScript codebase (Next.js API routes, Express,
Fastify, NestJS, etc.) — no separate build needed per consumer. Requires
Node 18+ (uses the global `fetch`/`AbortController`).

## Install

```
npm install @devcomdigital/license-sdk
```

Published publicly on npm — see [@devcomdigital/license-sdk](https://www.npmjs.com/package/@devcomdigital/license-sdk).

## Get an API key

In the Devcom Digital admin: **Tools -> (your tool) -> Edit -> License
verification API key -> Generate new key**. Copy it immediately — it's
shown once and stored elsewhere only as a hash.

## Usage

```ts
// ESM / TypeScript
import { DevcomLicense } from "@devcomdigital/license-sdk";

const license = new DevcomLicense({
  apiKey: process.env.DEVCOM_TOOL_API_KEY!,
  // baseUrl defaults to https://devcomdigital.com — override for local/staging.
});

const result = await license.verify(userSuppliedKey);

if (!result.valid) {
  // result.reason: "not_found" | "revoked" | "subscription_inactive"
  //              | "network_error" | "unauthorized"
  return res.status(403).json({ error: "Subscription required", reason: result.reason });
}

// result.userId is the Devcom user id the key belongs to.
```

```js
// CommonJS — identical API, just require() instead of import
const { DevcomLicense } = require("@devcomdigital/license-sdk");

const license = new DevcomLicense({ apiKey: process.env.DEVCOM_TOOL_API_KEY });
const result = await license.verify(userSuppliedKey);
```

### Options

| Option        | Default                     | Notes                                                                 |
| ------------- | ---------------------------- | ---------------------------------------------------------------------|
| `apiKey`      | required                     | Per-tool key from the admin.                                         |
| `baseUrl`     | `https://devcomdigital.com`  | Point at a local/staging deployment during development.              |
| `cacheTtlMs`  | `600000` (10 min)            | How long a result is cached in memory per key. `0` disables caching. |
| `onError`     | `"closed"`                   | On a network/server failure: `"closed"` = treat as invalid (safe default), `"open"` = treat as valid. Only use `"open"` if an outage on Devcom's side must never block your tool. |
| `timeoutMs`   | `5000`                       | Verify request timeout.                                              |

Results are cached **in-process, per key** — fine for a single server;
in a multi-instance deployment each instance keeps its own cache, so a
revoked license can take up to `cacheTtlMs` to be reflected on every
instance.

### Express middleware

```ts
import { requireLicense } from "@devcomdigital/license-sdk/express";

app.use("/api/protected", requireLicense(license));
// reads the key from the `x-license-key` header by default; pass
// `getLicenseKey` to read it from somewhere else (query param, body, etc.)
```

## Development

```bash
npm install
npm run build      # tsup: emits dist/*.cjs + dist/*.js (ESM) + .d.ts/.d.cts
npm run typecheck
```
