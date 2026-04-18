# Deployment

## Target

Production deploy target:
- Azure Static Web Apps
- root domain: `www.enterpriseai.tools`

## Workflow contract

The checked-in workflow builds the static export and uploads the prebuilt `out/` directory.

Workflow file:
- `.github/workflows/azure-static-web-apps-blue-stone-07d50c303.yml`

Required GitHub secret:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`

Production deploy expectations:
- root-domain deployment only
- `NEXT_PUBLIC_BASE_PATH` should remain unset for production
- static export must succeed before upload

## Verification

Repo-local checks:

```bash
npm run check-deploy-readiness
npm run check-custom-domain-readiness
npm run smoke-test-live-site -- root https://www.enterpriseai.tools
```

External checks still required:
- workflow run succeeds on `main`
- Azure SWA receives the artifact
- live site returns HTTP 200 on required routes/assets

## Known blocking failure mode

Current observed GitHub Actions failure on PR #5:
- `Deploy to Azure Static Web Apps`
- `Reason: No matching Static Web App was found or the api key was invalid.`

What that means operationally:
- the GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN` does not match the intended Azure Static Web App, or
- the repo/branch is not wired to the expected Azure Static Web App instance.

Operator fix path:
1. In Azure Static Web Apps, open the intended production app for `enterpriseai.tools`
2. Regenerate or copy the deployment token from that exact app
3. Update the GitHub repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN`
4. Confirm the Azure Static Web App is connected to this repository
5. Re-run the workflow and verify the deploy step reaches a successful upload

## Operator verification checklist

After updating the Azure app wiring / token, verify in this order:

1. GitHub Actions `Azure Static Web Apps CI/CD` succeeds on the relevant branch or PR
2. The Azure deploy step no longer reports `No matching Static Web App was found or the api key was invalid.`
3. The generated site is reachable at the Azure default hostname or intended production hostname
4. Run the repo smoke test against production:

```bash
npm run smoke-test-live-site -- root https://www.enterpriseai.tools
```

5. Only after deploy is green, proceed to the custom-domain checklist in `CUSTOM_DOMAIN.md`

## What is already verified locally

The following are already green from this repo and do not need further code changes unless the workflow behavior changes:

```bash
npm run lint
npm run build
npm run check-deploy-readiness
npm run check-custom-domain-readiness
```
