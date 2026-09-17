# Deployment

## Target

Production deploy target:
- Azure Static Web Apps
- root domain: `www.enterpriseai.tools`

## Workflow contract

The checked-in workflow builds the static export and uploads the prebuilt `out/` directory.

Workflow file:
- `.github/workflows/azure-static-web-apps-witty-grass-0a1a9d403.yml`

Required GitHub secret:
- `AZURE_STATIC_WEB_APPS_API_TOKEN_WITTY_GRASS_0A1A9D403`

Production deploy expectations:
- root-domain deployment only
- `NEXT_PUBLIC_BASE_PATH` should remain unset for production
- static export must succeed before upload

## Verification

Repo-local checks:

```bash
npm run check-seo-readiness
npm run check-live-performance -- https://www.enterpriseai.tools
npm run check-deploy-readiness
npm run check-custom-domain-readiness
npm run smoke-test-live-site -- root https://www.enterpriseai.tools
```

External checks still required:
- workflow run succeeds on `main`
- Azure SWA receives the artifact
- live site returns HTTP 200 on required routes/assets
- production robots/sitemap/canonical responses match the intended canonical root domain (`https://www.enterpriseai.tools`)

## Production launch + SEO verification checklist

After merging to `main` and/or updating the Azure app wiring, verify in this order:

1. GitHub Actions `Azure Static Web Apps CI/CD` succeeds on the relevant branch or `main`
2. The generated site is reachable at the Azure default hostname or intended production hostname
3. Run the repo smoke test against production:

```bash
npm run smoke-test-live-site -- root https://www.enterpriseai.tools
```

4. Verify crawlability/indexability on the production domain:
   - `https://www.enterpriseai.tools/robots.txt` returns HTTP 200
   - `https://www.enterpriseai.tools/sitemap.xml` returns HTTP 200
   - `https://www.enterpriseai.tools/updates.xml` returns HTTP 200
   - canonical tags point at `https://www.enterpriseai.tools`
   - major hubs (`/`, `/platforms/`, `/agents/`, `/orchestration/`, `/governance/`, `/assistants/`, `/updates/`, `/about/`) render expected titles/descriptions
5. Validate structured data on the main indexed hubs (at minimum `WebSite`, `Organization`, `BreadcrumbList`, `CollectionPage`, and `ItemList` where applicable)
6. Run the live Lighthouse gate against the deployed hostname and review any regressions before calling launch complete:

```bash
npm run check-live-performance -- https://www.enterpriseai.tools
```

Default coverage is `/`, `/platforms`, and `/agents`; pass explicit routes if another hub needs checking.
7. In Google Search Console / Bing Webmaster Tools after the domain is stable:
   - verify the production property
   - submit `https://www.enterpriseai.tools/sitemap.xml`
   - inspect the core hub URLs for indexability
   - monitor coverage/crawl issues before making broader content changes
8. Confirm the trailing-slash normalisation is live (`staticwebapp.config.json`
   sets `"trailingSlash": "auto"`), so each page is indexed under exactly one URL
   while the feeds and JSON API keep their file paths:

```bash
curl -sI https://www.enterpriseai.tools/platforms          # expect 301 -> /platforms/
curl -sI https://www.enterpriseai.tools/tools/langgraph    # expect 301 -> /tools/langgraph/
curl -sI https://www.enterpriseai.tools/platforms/         # expect 200
curl -sI https://www.enterpriseai.tools/updates.xml        # expect 200, NOT a redirect
curl -sI https://www.enterpriseai.tools/api/v1/index.json  # expect 200, NOT a redirect
curl -sI https://www.enterpriseai.tools/robots.txt         # expect 200, NOT a redirect
```

   The page redirects and ordinary untouched asset paths were reproduced against
   Azure Static Web Apps CLI 2.0.10 before merge:

```bash
cp staticwebapp.config.json out/ && npx swa start out --port 4599
```

   SWA CLI 2.0.10 reserves `/api/*` for Functions and returns `502` for
   `/api/v1/index.json` when no Functions app is present, even though Azure
   production serves this repository's static API file directly with `200`.
   Treat that response as an emulator limitation and verify the API path against
   production after deployment. The production smoke test still requires a
   direct `200`.

   One caveat: the Azure docs also list `/index.html` -> `301 /` under this mode,
   but the emulator serves it `200`. Check it after deploy and treat a `200` as a
   known gap rather than a regression — it returned `200` before this change too:

```bash
curl -sI https://www.enterpriseai.tools/index.html   # 301 -> / preferred; 200 is the pre-existing behaviour
```

9. Only after deploy + SEO checks are green, proceed to the custom-domain checklist in `CUSTOM_DOMAIN.md`

## Azure config must ship inside `out/`

`staticwebapp.config.json` lives at the repo root, but Azure Static Web Apps
reads it from the **root of the uploaded artifact**. The deploy job sets
`app_location: "out"` with `skip_app_build: true`, so only `out/` is uploaded.

A config left at the repo root is therefore never seen by the platform, and
every rule in it — routing, headers, the custom 404, trailing-slash
normalisation — is silently ignored. Nothing fails: the workflow is green, the
site serves, and the rules simply do nothing. This is exactly how the trailing
slash change shipped inert the first time.

`npm run build` now runs `scripts/copy-swa-config.mjs` after `next build` (which
regenerates `out/` from scratch), and two gates keep it honest:

- `npm run check-deploy-readiness` fails if `out/staticwebapp.config.json` is
  missing or differs from the source.
- `npm run smoke-test-live-site` fails if a non-slash page route does not `301`
  in production, which is the only way to prove the config actually applied.

To confirm by hand, compare a live response header against the config: the
config sets `Cache-Control: public, max-age=0, must-revalidate`, so a live value
of `max-age=30` means Azure is serving its own default and the config is absent.

```bash
curl -sI https://www.enterpriseai.tools/ | grep -i cache-control
```

## Analytics configuration (build-time, never committed)

Google Analytics 4 is wired through `NEXT_PUBLIC_GA_MEASUREMENT_ID`, read by
`lib/analytics.ts` and inlined by `next build`. The repository is public, so the
value lives in GitHub, not in source:

1. GitHub repo -> **Settings** -> **Secrets and variables** -> **Actions** ->
   **Variables** tab -> **New repository variable**
2. Name `NEXT_PUBLIC_GA_MEASUREMENT_ID`, value the `G-XXXXXXXXXX` measurement ID
3. Re-run the workflow; the deploy job passes it into the build step

Notes:

- Azure Static Web Apps **application settings do not work for this**. They are
  only injected into managed API functions, and this site is a static export
  built in GitHub Actions — the variable must exist at build time.
- When the variable is unset the site builds with no analytics and no consent
  banner. That is the intended behaviour for forks and local builds.
- Nothing is requested from googletagmanager.com until a visitor accepts the
  banner. Verify after deploy by loading the site with devtools open: there must
  be zero requests to Google before clicking accept, and a `_ga` cookie only
  after.
- Changing the analytics posture means updating `/privacy`, `/impartiality`, the
  home FAQ in `lib/hub-faqs.ts`, and the `llms.txt` copy in
  `scripts/generate-seo-artifacts.mjs` in the same PR.

## Historical failure mode (resolved on the PR branch)

A prior PR-stage blocker was:
- `Deploy to Azure Static Web Apps`
- `Reason: No matching Static Web App was found or the api key was invalid.`

That failure mode is retained here as operator context only. If it reappears, the likely fix path is still:
1. In Azure Static Web Apps, open the intended production app for `enterpriseai.tools`
2. Regenerate or copy the deployment token from that exact app
3. Update the GitHub repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN`
4. Confirm the Azure Static Web App is connected to this repository
5. Re-run the workflow and verify the deploy step reaches a successful upload

## What is already verified locally

The following are already green from this repo and do not need further code changes unless the workflow behavior changes:

```bash
npm run lint
npm run build
npm run check-deploy-readiness
npm run check-custom-domain-readiness
```
