# Custom domain handoff

## Intended domain

- `www.enterpriseai.tools`

## Production assumption

Production is a root-domain Azure Static Web Apps deployment.

Do **not** use `/enterpriseai-tools` subpath deployment rules for production.

## External steps

1. Add `www.enterpriseai.tools` as a custom domain in Azure Static Web Apps
2. Apply the DNS records Azure requests
3. Wait for Azure validation to complete
4. Run live smoke tests against the root domain

## Post-cutover verification

```bash
npm run smoke-test-live-site -- root https://www.enterpriseai.tools
```
