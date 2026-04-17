# enterpriseai.tools

Static Next.js site for the enterprise AI tooling landscape tracker.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- JSON-backed datasets in `data/`
- Static export via `next build` (`output: "export"`)

## Local development

```bash
npm ci
npm run lint
npm run build
```

For local dev server:

```bash
npm run dev
```

## Stable preview publishing

The repo-local preview server should serve a last-known-good exported snapshot rather than the live `out/` directory.

Why: `next build` rewrites `out/`, which can cause transient broken responses while a rebuild is in progress.

Publish the latest successful export into the stable preview slot with:

```bash
npm run build
npm run publish-preview
```

This copies `out/` into `.preview/releases/<timestamp>/` and atomically repoints `.preview/current` to the new release so the preview server can keep serving during rebuilds.

## Base path behavior

The site reads `NEXT_PUBLIC_BASE_PATH` at build time.

- Preview / subpath deploys: set `NEXT_PUBLIC_BASE_PATH=/enterpriseai-tools`
- Root-domain deploys: leave it unset / empty

This keeps local preview and Azure deployment using the same codebase.

## Azure Static Web Apps deployment

The repo includes Azure Static Web Apps workflow/config assets under `.github/workflows/` and `staticwebapp.config.json`.

The checked-in workflow now matches this repo's real delivery path:

- install dependencies with `npm ci`
- run `npm run lint`
- run `npm run build` to generate the static `out/` export
- upload the prebuilt `out/` directory to Azure Static Web Apps
- close SWA PR preview environments automatically when a PR is closed

### Required GitHub secrets / variables

- `AZURE_STATIC_WEB_APPS_API_TOKEN` — deployment token from the Azure Static Web App
- `NEXT_PUBLIC_BASE_PATH` (repository variable, optional) — set only when deploying under a subpath

### Expected production setup

For `enterpriseai.tools` on the root domain:

- do **not** set `NEXT_PUBLIC_BASE_PATH`
- connect the GitHub repository to Azure Static Web Apps
- add the `AZURE_STATIC_WEB_APPS_API_TOKEN` repository secret
- let the workflow build and upload the pre-rendered `out/` directory

### Preview / subpath setup

For preview or subdirectory hosting:

- set `NEXT_PUBLIC_BASE_PATH=/enterpriseai-tools` as a GitHub repository variable
- keep using the same workflow; it forwards the variable into the static build

## PR + automation helpers

### `npm run open-pr`

Repo-local GitHub PR helper that:

- refuses to run from `main`
- prefers `GH_TOKEN` / `GITHUB_TOKEN`
- falls back to a PAT embedded in `origin` when present
- creates a PR or updates the existing open PR for the current branch

Examples:

```bash
npm run open-pr -- --dry-run
npm run open-pr -- --title "feat: add X" --body-file .tmp/pr.md
```

### `npm run check-deploy-readiness`

Repo-local Azure Static Web Apps handoff check:

1. validates the checked-in SWA workflow and config
2. confirms the repo scripts needed for build/preview/PR flow exist
3. checks the public preview returns HTTP 200
4. prints the remaining GitHub/Azure items that still need external access

See also: `DEPLOYMENT.md`

### `npm run check-custom-domain-readiness`

Repo-local custom-domain handoff check for `enterpriseai.tools`:

1. validates root-domain deployment docs are checked in
2. confirms the repo does not hardcode the preview subpath into `next.config.ts`
3. verifies the public preview still returns HTTP 200
4. prints the remaining Azure/DNS items that still need operator access

See also: `CUSTOM_DOMAIN.md`

### `npm run smoke-test-export -- root`

Repo-local export smoke test for the production/root-domain shape:

1. builds with `NEXT_PUBLIC_BASE_PATH` unset
2. verifies expected exported routes exist in `out/`
3. verifies canonical URLs point at `https://enterpriseai.tools/...`
4. fails if any `/enterpriseai-tools` preview-only URLs leak into the root export

### `npm run smoke-test-export -- subpath`

Repo-local export smoke test for the preview/subpath shape:

1. builds with `NEXT_PUBLIC_BASE_PATH=/enterpriseai-tools`
2. verifies expected exported routes exist in `out/`
3. verifies canonical URLs still point at `https://enterpriseai.tools/...`
4. verifies exported asset and route links are prefixed with `/enterpriseai-tools`

### `npm run smoke-test-live-site -- subpath`

Live deployment smoke test for the preview/subpath URL:

1. checks `/`, `/platforms/`, `/agents/`, and `/updates/` return HTTP 200 HTML
2. verifies known public assets (`robots.txt`, `sitemap.xml`, social preview, logo asset) return HTTP 200
3. verifies canonical URLs still point at `https://enterpriseai.tools/...`
4. verifies the deployed HTML still uses `/enterpriseai-tools`-prefixed routes/assets

### `npm run smoke-test-live-site -- root`

Live deployment smoke test for the root-domain launch URL:

1. defaults to `https://enterpriseai.tools`
2. checks the main routes return HTTP 200 HTML
3. verifies known public assets return HTTP 200
4. fails if any preview-only `/enterpriseai-tools` references leak into the live HTML

### `npm run test-full-cycle`

Dry-run verification for the repeatable maintenance path:

1. runs `npm run lint`
2. runs `npm run build`
3. runs `npm run publish-preview`
4. checks the public preview returns HTTP 200
5. exercises `npm run open-pr -- --dry-run`

Default behavior is non-destructive; it does not create or merge a PR.

## Data rules

- Do not fabricate tool metadata
- Prefer primary sources for feature, pricing, release, and support claims
- Keep changes reviewable and source-backed
