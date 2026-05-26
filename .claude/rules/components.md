# Rules for `components/**`

Applies to: shared React components.

Always pair with the `static-export-safe` skill before touching code.

## Hard rules

1. **Static-export safe.** No runtime third-party fetches, no analytics scripts,
   no third-party fonts pulled at load. Components render from props and the
   build-time dataset only.
2. **Server-first.** Default to server components. Add `'use client'` only when
   a component genuinely needs interactivity or browser APIs, and keep that
   client boundary as small as possible.
3. **No `next/headers`, `next/cookies`, or dynamic request APIs.** They break
   static export — see `.claude/rules/app-routes.md`.
4. **Structured data lives in `components/json-ld.tsx`.** Don't hand-roll
   JSON-LD in page files.
5. **No `any`.** Type props with explicit interfaces; use `unknown` + guards at
   any boundary.

## Conventions

- File names: kebab-case (`tool-card.tsx`). Component names: PascalCase
  (`ToolCard`).
- Import alias `@/*`.
- Presentational logic only — data selection/derivation belongs in `lib/` so it
  can be unit-tested.

## After any change under `components/`

```bash
npx tsc --noEmit
npm run lint
npm run build   # must still emit static out/
```

Commit prefix is `feat:` / `fix:` / `refactor:`.
