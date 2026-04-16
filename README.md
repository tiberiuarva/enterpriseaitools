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

## Base path behavior

The site reads `NEXT_PUBLIC_BASE_PATH` at build time.

- Preview / subpath deploys: set `NEXT_PUBLIC_BASE_PATH=/enterpriseai-tools`
- Root-domain deploys: leave it unset / empty

This keeps local preview and Azure deployment using the same codebase.

## Azure Static Web Apps deployment

A GitHub Actions workflow is included at `.github/workflows/azure-static-web-apps.yml`.

### Required GitHub secrets / variables

- `AZURE_STATIC_WEB_APPS_API_TOKEN` — deployment token from the Azure Static Web App
- `NEXT_PUBLIC_BASE_PATH` (repository variable, optional) — set only when deploying under a subpath

### Expected production setup

For `enterpriseai.tools` on the root domain:

- do **not** set `NEXT_PUBLIC_BASE_PATH`
- connect the GitHub repository to Azure Static Web Apps
- let the workflow build and upload the pre-rendered `out/` directory

### Workflow behavior

- runs on pushes to `main`
- runs on pull requests to `main`
- lints and builds before deploy
- uploads the static export in `out/`
- closes preview environments when PRs are closed

## Data rules

- Do not fabricate tool metadata
- Prefer primary sources for feature, pricing, release, and support claims
- Keep changes reviewable and source-backed
