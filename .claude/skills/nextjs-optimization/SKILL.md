---
name: nextjs-optimization
description: Use when auditing or improving performance for this Next.js app — images, fonts, scripts, metadata/OG images, static assets, bundle size, lazy loading, analytics, instrumentation, OpenTelemetry, or third-party library loading. Triggers on "optimize this page", "improve performance", "bundle size", "Core Web Vitals", "lazy load", "why is this slow", "reduce bundle", "analyze bundle", "add instrumentation", "opentelemetry", "third-party script", "optimize images/fonts".
version: 1.0.0
user-invocable: true
---

# Next.js Optimization Playbook

This repo pins a Next.js version whose APIs can differ from what you were trained on — [AGENTS.md](../../../AGENTS.md) already says so. **Never optimize from memory or from the public nextjs.org/docs site.** This skill exists specifically because the user pointed at the public `/docs/14/...` optimizing guide, and this project is on Next 16.x — the mechanisms below (especially Images, Scripts, Instrumentation) have changed across versions. Before touching any category, read the matching local doc file first — it reflects the exact version installed at `node_modules/next`.

Doc paths below are relative to the repo root. Read the whole file for the category you're working on, not just a grep hit — these guides have version-specific caveats (e.g. `sizes`, `fill` requirements, config keys) that a partial read will miss.

## 0. Orient first

1. Confirm the installed version: `node_modules/next/package.json` → `"version"`.
2. Read `AGENTS.md` at the repo root (already loaded into context normally, but re-check if this session is old).
3. Identify which categories are actually in scope for the request — don't sweep all eleven unless asked for a full audit.

## Category → local doc map

| Category | Local doc(s) to read | Notes |
|---|---|---|
| **Images** | `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`, `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`, `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/images.md` | `next/image` requires `width`+`height` or `fill` (needs a `position:relative` ancestor with a defined size) or `sizes`. Remote images need `images.remotePatterns` in `next.config.ts` — this repo already has one for `*.public.blob.vercel-storage.com`. See recent history in this repo: cards use `fill`+`sizes`, hero/detail images intentionally use a plain `<img>` when the aspect ratio is unknown and must not crop (see [tools/[slug]/page.tsx](../../../src/app/tools/%5Bslug%5D/page.tsx)). |
| **Fonts** | `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`, `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` | This repo already uses `next/font/google` in [layout.tsx](../../../src/app/layout.tsx) (Syne, Plus Jakarta Sans, Space Mono) with CSS variables — check new font usage follows the same variable-based pattern instead of `<link>` tags or `@import`. |
| **Scripts** | `node_modules/next/dist/docs/01-app/02-guides/scripts.md` | Use `next/script`, not a raw `<script>` tag, for any third-party script. Pick the right `strategy` (`beforeInteractive` / `afterInteractive` / `lazyOnload` / `worker`). Check [google-analytics.tsx](../../../src/components/google-analytics.tsx) for the existing pattern before adding another script. |
| **Metadata** | `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`, `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`, `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-image-metadata.md`, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md` | Static `metadata` export vs `generateMetadata` — this repo mixes both (see [layout.tsx](../../../src/app/layout.tsx) for static, [projects/[slug]/page.tsx](../../../src/app/projects/%5Bslug%5D/page.tsx) for dynamic + JSON-LD). Keep `alternates.canonical` and OG fields consistent with [src/lib/seo.ts](../../../src/lib/seo.ts). |
| **Static Assets** | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/public-folder.md`, `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md` | Anything in `public/` is served at `/`, cached long-term by the platform — don't put per-user or frequently-changing data there. Prefer `next/image`/`next/font` over manual `public/` references when the asset is a page image or font. |
| **Bundle Analyzer** | `node_modules/next/dist/docs/01-app/02-guides/package-bundling.md` | This repo runs on Turbopack (confirmed via `next build` output), so use the **built-in, no-install** `npx next experimental-analyze` (Next 16.1+) instead of the older `@next/bundle-analyzer` webpack plugin — that plugin is Webpack-only and irrelevant here unless the project is later forced onto Webpack. Add `--output <file>` to save a diffable snapshot. Read `optimizePackageImports` guidance in the doc before hand-rolling per-import fixes for icon/utility libraries. |
| **Lazy Loading** | `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md` | `next/dynamic` for client components / heavy libraries; `loading="lazy"` (default for `next/image` below the fold) for images. This repo already marks non-first cards `loading="lazy"` and the first above-the-fold card `priority` — see [tools/page.tsx](../../../src/app/tools/page.tsx) and [projects/page.tsx](../../../src/app/projects/page.tsx). |
| **Analytics** | `node_modules/next/dist/docs/01-app/02-guides/analytics.md` | Covers Web Vitals reporting (`useReportWebVitals` / `next/web-vitals`) as distinct from GA pageview tracking already wired up here. |
| **Instrumentation** | `node_modules/next/dist/docs/01-app/02-guides/instrumentation.md` | `instrumentation.ts` at repo root (or `src/`) with a `register()` export, run once per server instance — check it doesn't already exist before creating one. |
| **OpenTelemetry** | `node_modules/next/dist/docs/01-app/02-guides/open-telemetry.md` | Only pull this in if the request is actually about tracing/observability — it's a heavier dependency (`@vercel/otel` or manual OTel SDK) and pairs with the Instrumentation hook above. |
| **Third Party Libraries** | `node_modules/next/dist/docs/01-app/02-guides/third-party-libraries.md` | `@next/third-parties` package for common integrations (YouTube embed, Google Maps, etc.) before hand-writing a wrapper. |

## Working process

1. **Scope**: ask (or infer from the request) which of the above categories apply. Don't run a full 11-category audit unless explicitly asked for one.
2. **Read the local doc(s)** for each in-scope category — full file, not a snippet.
3. **Check current repo state** before changing anything: grep for existing usage (`next/image`, `next/font`, `next/script`, `next/dynamic`, `instrumentation.ts`, `@next/bundle-analyzer`) so you extend the established pattern instead of introducing a second one.
4. **Make the change**, matching this repo's existing conventions (Tailwind classes, `ButtonLink`/`Image` usage patterns already in the codebase, server-vs-client component boundaries).
5. **Verify**: `npx tsc --noEmit` (this repo has two known-unrelated pre-existing errors in `src/lib/auth.ts` and `examples/license-demo-tool` — don't treat those as regressions), and where feasible `npx next build` to confirm the change compiles under Turbopack.
6. Report what changed and, if a category was skipped (e.g. OpenTelemetry not needed), say so rather than silently omitting it.
