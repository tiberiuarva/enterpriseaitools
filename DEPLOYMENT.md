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
- production robots/sitemap/canonical responses match the intended root domain

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
   - canonical tags point at the intended production root domain
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
7. Only after deploy + SEO checks are green, proceed to the custom-domain checklist in `CUSTOM_DOMAIN.md`

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
