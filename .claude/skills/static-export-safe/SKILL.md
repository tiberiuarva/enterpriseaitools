---
name: static-export-safe
description: Use whenever editing app/**, components/**, or next.config.ts to ensure no server-only Next.js feature sneaks in. This site is statically exported to Azure Static Web Apps; any runtime server requirement breaks the deploy.
---

# Static-export safety

`npm run build` must produce a fully static `out/` directory. The Azure Static
Web Apps workflow uploads `out/` with `skip_app_build: true` — there is no
runtime Node server in production.

## Hard rules

- **No `route.ts`, no API routes.** Any data needed at runtime must be present
  in the static bundle.
- **No `middleware.ts`.** Static export has no middleware layer.
- **No server actions.** No `'use server'` directives.
- **No `next/headers` or `next/cookies`** at request time — both require a
  server runtime.
- **No `dynamic = "force-dynamic"`** in any route.
- **No `fetch()` at runtime** for non-public-CDN URLs. Build-time fetches are
  fine (they execute in `next build`); runtime fetches in the browser are fine
  if they hit public CDNs, but this site avoids them entirely.
- **No build-time secrets in the bundle.** Read env in `scripts/` or in
  `next.config.ts`; never inline a token into a component.

## Quick self-check before opening a PR

Run:

```bash
npm run build
ls out/
```

`out/` should contain `.html` files for every route in `app/`. If `next build`
emits a warning like "Detected dynamic usage of …" or "Page is not statically
optimizable", you have a server-only dependency to remove.

## When a feature genuinely needs runtime state

- Move it to build-time generation in `scripts/generate-seo-artifacts.mjs` (or
  a sibling script).
- Or, accept that it lives in the user's browser only — pure client component
  hydrated after load, no SSR dependency.

If neither works for a real feature, escalate to the user before adopting a
non-static hosting path — switching off static export is a P0 architecture
change.
