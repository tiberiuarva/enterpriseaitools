# enterpriseai.tools

Enterprise AI tooling landscape tracker built as a static Next.js export.

## Local development

```bash
npm ci
npm run dev
```

## Validation

```bash
npm run lint
npm run build
npm run check-deploy-readiness
npm run check-custom-domain-readiness
npm run publish-preview
```

## PR helper

The repo includes a helper to create or update a PR for the current branch.

```bash
npm run open-pr -- --dry-run
```

Rules:
- do not run from `main`
- use a clean working tree for real PR creation
- auth may come from `GH_TOKEN`, `GITHUB_TOKEN`, or a PAT-backed remote URL

## Deployment target

Production target is Azure Static Web Apps on the root domain:
- `www.enterpriseai.tools`

This repo no longer treats `/enterpriseai-tools` on the test VM as a deployment target or supported deployment contract.

### Azure Static Web Apps

Checked-in workflow:
- `.github/workflows/azure-static-web-apps-blue-stone-07d50c303.yml`

Expected GitHub secret:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`

Expected build shape:
- static export uploaded from `out/`
- root-domain deployment
- no `NEXT_PUBLIC_BASE_PATH` required for production

## Deployment checks

```bash
npm run check-deploy-readiness
npm run check-custom-domain-readiness
npm run publish-preview
npm run smoke-test-live-site -- root https://www.enterpriseai.tools
```

## Notes

- Some logos are still placeholders and should be replaced with sourced official assets where defensible.
- Production remains an Azure Static Web Apps root-domain deploy. Use `DEPLOYMENT.md` for the launch + SEO verification checklist, then `CUSTOM_DOMAIN.md`, then rerun `npm run smoke-test-live-site -- root https://www.enterpriseai.tools`.
- Custom-domain acceptance and DNS cutover remain external Azure/DNS tasks.
- A prior Azure deploy mismatch (`No matching Static Web App was found or the api key was invalid.`) is now historical context, not the current repo-side state; keep it only as an operator troubleshooting note.
