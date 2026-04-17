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
