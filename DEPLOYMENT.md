# Deployment handoff

This repo is static-exported Next.js and is intended to deploy via Azure Static Web Apps.

## Repo-local readiness check

Run this before handing off or reconnecting Azure/GitHub settings:

```bash
npm run check-deploy-readiness
```

What it verifies inside the repo:

- SWA workflow file exists
- workflow uses `npm ci`, `npm run lint`, and `npm run build`
- workflow uploads the prebuilt `out/` export with `skip_app_build: true`
- workflow references `AZURE_STATIC_WEB_APPS_API_TOKEN`
- workflow forwards `NEXT_PUBLIC_BASE_PATH`
- `staticwebapp.config.json` contains SPA fallback + asset excludes
- `package.json` exposes the repo automation scripts
- public preview currently returns HTTP 200

What it cannot verify from inside the repo:

- GitHub repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN`
- GitHub repository variable `NEXT_PUBLIC_BASE_PATH`
- Azure Static Web App ↔ GitHub connection state
- Azure custom domain validation / DNS records for `enterpriseai.tools`

Before handoff, also prove the export shape locally in both modes:

```bash
npm run smoke-test-export -- root
npm run smoke-test-export -- subpath
```

For any live environment you can reach, also verify the deployed URL directly:

```bash
npm run smoke-test-live-site -- subpath
npm run smoke-test-live-site -- root
```

For the remaining root-domain handoff, also run:

```bash
npm run check-custom-domain-readiness
```

See `CUSTOM_DOMAIN.md` for the operator checklist and post-cutover smoke tests.

## Production target: root domain

Target production shape for `enterpriseai.tools`:

- domain: `https://enterpriseai.tools/`
- `NEXT_PUBLIC_BASE_PATH` unset / empty
- SWA workflow builds and uploads `out/`
- Azure custom domain mapped to the SWA instance

## Preview / subpath target

Target preview shape:

- URL shape: `/enterpriseai-tools/`
- set `NEXT_PUBLIC_BASE_PATH=/enterpriseai-tools`
- use the same workflow and static export

## External checklist

### GitHub

- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN` added as a repository secret
- [ ] `NEXT_PUBLIC_BASE_PATH` repo variable is:
  - unset for root-domain production, or
  - `/enterpriseai-tools` for subpath preview deploys
- [ ] workflow is enabled for the correct repository

### Azure Static Web Apps

- [ ] app is connected to this GitHub repository
- [ ] production branch is `main`
- [ ] workflow run completes successfully
- [ ] deployed site serves the expected base path behavior

### Custom domain (`enterpriseai.tools`)

- [ ] add the domain in Azure Static Web Apps
- [ ] apply the DNS records Azure requests (CNAME/TXT or apex mapping as applicable)
- [ ] wait for Azure validation to complete
- [ ] re-check canonical URLs and asset paths on the live domain

## Post-cutover verification

- [ ] home page returns HTTP 200
- [ ] category pages return HTTP 200
- [ ] logos load without SPA fallback rewrites
- [ ] canonical URLs point at `https://enterpriseai.tools/...`
- [ ] social preview image resolves from the live domain
- [ ] no `/enterpriseai-tools` prefix appears on the root-domain deployment
