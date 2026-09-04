# license-demo-tool

Minimal reference example for a third-party tool integrating
`@devcomdigital/license-sdk`. Two pieces:

- `server/` — a tiny Express backend that verifies license keys with the
  SDK (`requireLicense` middleware) and never runs in the browser.
- `src/` — a React (Vite) frontend that asks the user for their Devcom
  license key and sends it to this tool's own backend, not to
  devcomdigital.com directly.

This mirrors how any real tool in the suite (SEO/keyword research, social
scheduler, campaign analytics, ad creative generator) should gate access:
the browser never talks to the license API or holds an API key — only this
backend does.

## Setup

```bash
npm install
cp .env.example .env   # fill in DEVCOM_TOOL_API_KEY from the Devcom admin
```

## Run

```bash
npm run dev:server   # backend on :4000
npm run dev:client   # frontend on :5173
```

Get a per-tool API key from the Devcom admin: **Tools -> (your tool) ->
Edit -> License verification API key -> Generate new key**. Set
`DEVCOM_BASE_URL` to wherever the Devcom app is running (defaults to
`http://localhost:3000` for local development against this repo).

## How it works

1. The React form takes the license key the user pastes in and stores it
   locally (for convenience), then sends it as `x-license-key` to this
   tool's backend on every protected request.
2. `server/index.ts` mounts `requireLicense(license)` from
   `@devcomdigital/license-sdk/express` in front of `/api/protected/*`.
   The middleware calls `DevcomLicense.verify()`, which POSTs to
   `/api/license/verify` on the main Devcom app using the tool's API key.
3. On success the route sees `req.devcomLicense.userId`; on failure the
   middleware responds `403` with a `reason` (`not_found`, `revoked`,
   `subscription_inactive`, `network_error`, `unauthorized`).
