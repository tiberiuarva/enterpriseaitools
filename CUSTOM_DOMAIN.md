# Custom domain handoff

This project is intended to end up at the root domain:

- production URL: `https://enterpriseai.tools/`
- framework output: static export (`out/`)
- production base path: unset / empty `NEXT_PUBLIC_BASE_PATH`

This document exists because the remaining work for the custom domain is **not** in repo code anymore. It is an environment-side Azure + DNS task.

## Repo-local verification

Run:

```bash
npm run check-custom-domain-readiness
npm run smoke-test-export -- root
```

What it verifies from inside the repo:

- `README.md` documents root-domain deployment without `NEXT_PUBLIC_BASE_PATH`
- `DEPLOYMENT.md` documents the Azure custom-domain handoff
- the Azure workflow expects the standard `AZURE_STATIC_WEB_APPS_API_TOKEN` secret
- the workflow forwards `NEXT_PUBLIC_BASE_PATH` only as a repo variable input
- `next.config.ts` does not hardcode `/enterpriseai-tools`
- the public preview still serves successfully

What it cannot verify from inside the repo:

- Azure Static Web App instance exists and is healthy
- Azure has accepted `enterpriseai.tools` as a custom domain
- DNS records at the registrar / DNS host are correct
- TLS certificate issuance has completed
- GitHub repo variable `NEXT_PUBLIC_BASE_PATH` is cleared for root-domain production

## Target production state

Expected final shape for launch:

- `enterpriseai.tools` resolves to the Azure Static Web App
- `https://enterpriseai.tools/` returns 200
- no `/enterpriseai-tools` prefix appears on canonical URLs or asset URLs
- logos and social assets load from the root domain
- route deep-links (for example `/platforms`, `/agents`, `/updates`) resolve correctly

## Operator checklist

### 1. GitHub repo configuration

- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN` exists as a repository secret
- [ ] `NEXT_PUBLIC_BASE_PATH` repository variable is **unset** (or empty) for root-domain production
- [ ] workflow is enabled for this repository and `main`

### 2. Azure Static Web Apps configuration

- [ ] Static Web App is connected to this GitHub repository
- [ ] production branch is `main`
- [ ] most recent workflow run completed successfully
- [ ] deployed export works correctly before adding the domain

### 3. Add `enterpriseai.tools` in Azure

In Azure Static Web Apps, add the custom domain `enterpriseai.tools`.

Azure will request one of the following depending on the exact setup:

- TXT validation record
- CNAME mapping (common for subdomain flows)
- apex/root-domain mapping instructions supported by Azure/DNS provider

Record exactly what Azure asks for and apply only that.

### 4. DNS changes

- [ ] add the Azure-provided verification TXT record
- [ ] add the Azure-provided target mapping for the domain/apex
- [ ] wait for DNS propagation
- [ ] re-run Azure validation until the domain is marked ready

### 5. Post-validation checks

After Azure marks the domain valid and HTTPS is ready:

- [ ] `curl -I https://enterpriseai.tools/` returns 200
- [ ] `curl -I https://enterpriseai.tools/platforms/` returns 200
- [ ] `curl -I https://enterpriseai.tools/agents/` returns 200
- [ ] `curl -I https://enterpriseai.tools/updates/` returns 200
- [ ] homepage HTML does not contain `/enterpriseai-tools/` URLs
- [ ] canonical URLs point at `https://enterpriseai.tools/...`
- [ ] preview-only subpath assumptions are gone from production

## Fast smoke tests after cutover

```bash
curl -I https://enterpriseai.tools/
curl -I https://enterpriseai.tools/platforms/
curl -I https://enterpriseai.tools/agents/
curl -I https://enterpriseai.tools/updates/
```

If any of those fail, check:

1. `NEXT_PUBLIC_BASE_PATH` was not left set to `/enterpriseai-tools`
2. Azure validation fully completed
3. DNS records match the exact Azure instructions
4. the latest `main` deployment actually succeeded
