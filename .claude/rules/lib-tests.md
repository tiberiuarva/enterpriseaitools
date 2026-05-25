# Rules for `lib/*.ts` and `lib/*.test.ts`

Applies to: pure TypeScript utilities under `lib/` and their colocated tests.

## Hard rules

1. **`lib/` is pure.** No React, no Next.js imports, no filesystem or network
   side effects at module load. Utilities take inputs and return outputs so they
   are trivially testable and safe to call at build time.
2. **Every new util has a colocated `*.test.ts`.** Same directory, same base
   name (`metadata.ts` → `metadata.test.ts`). Tests run on the Node built-in
   test runner: `node --experimental-strip-types --test`.
3. **No `any`.** Use `unknown` + type guards, or parse at the boundary. Prefer
   `import type` for type-only imports.
4. **Read data through typed loaders.** When a util consumes `data/*.json`,
   validate shape against `data/SCHEMA.md` rather than trusting the JSON.
5. **No `test.skip`, `it.only`, or commented-out assertions.** Fix the test or
   fix the code — never bypass a failure.

## Coverage thresholds (when wired into a runner)

70% lines / functions / statements, 65% branches on `lib/**`.

## After any change under `lib/`

```bash
npx tsc --noEmit
node --experimental-strip-types --test lib/<file>.test.ts   # the suite you touched
npm run test:eu-ai-act                                       # plus existing suites
```

Commit prefix is `feat:` / `fix:` / `refactor:` for code, `test:` for
test-only changes.
