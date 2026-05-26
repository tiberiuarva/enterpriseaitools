# Rules for `app/**`

Applies to: every file under `app/` (Next.js 16 App Router).

Always pair with the `static-export-safe` skill and the `next16-api-checker`
subagent before touching code.

## Hard rules

1. **Static export only.** No `route.ts`, no `middleware.ts`, no server
   actions, no `'use server'`. The deploy uploads a fully static `out/`.
2. **Read `node_modules/next/dist/docs/` before using any `next/*` API.**
   Next.js 16 has breaking changes vs. training data (per `AGENTS.md`).
3. **Every leaf route is a static-export target.** If you add a dynamic
   segment, supply a `generateStaticParams` that enumerates every value at
   build time.
4. **Metadata via `lib/metadata.ts`.** Don't duplicate canonical / title /
   description logic in page files.
5. **Structured data via `components/json-ld.tsx`.** Hub pages expect
   `WebSite`, `Organization`, `BreadcrumbList`, `CollectionPage`, and
   `ItemList` where applicable.
6. **No runtime third-party fetches.** No analytics scripts, no third-party
   fonts pulled at runtime, no client-side calls to vendor APIs.
7. **No `NEXT_PUBLIC_BASE_PATH` for prod.** Local previews may set it via
   `scripts/publish-preview.sh`; production builds leave it unset.

## After any change under `app/`

1. `npm run build` — must succeed and emit `.html` in `out/` for every route.
2. `npm run check-static-export-image-paths` (runs as the post-build step) —
   catches paths that won't resolve under static hosting.
3. `npm run check-seo-readiness` — catches missing canonical/title drift.
4. If routes or hub metadata changed, spawn `seo-auditor`.

## Hub routes (canonical list)

`/`, `/platforms/`, `/agents/`, `/orchestration/`, `/governance/`,
`/assistants/`, `/updates/`, `/about/`. Renaming or removing any of these is a
breaking SEO change — open a milestone and coordinate with redirects in
`staticwebapp.config.json`.
