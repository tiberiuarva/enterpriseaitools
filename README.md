# enterpriseai.tools

An open source landscape tracker for enterprise AI tooling, built from a regulated enterprise architect's perspective.

Live site: [www.enterpriseai.tools](https://www.enterpriseai.tools/)

---

## Why this exists

Enterprise architects evaluating AI tooling face the same friction every time: vendor marketing pages use different terminology for the same things, open source projects change names and licenses without warning, and the pace of acquisitions makes last month's comparison blog already stale.

This tracker exists to cut through that. It compares what the three cloud vendors (Microsoft Foundry, AWS Bedrock, Google Vertex AI) offer alongside the leading open source alternatives, across four categories: agent frameworks, orchestration, governance, and assistants. Every data point is source-backed. Updates ship weekly.

The lens is practitioner-first, with particular attention to what works inside regulated environments — EU AI Act, DORA, SR 11-7, BCBS 239 constraints that shape real decisions but rarely appear in vendor comparisons.

## What's tracked

- Platforms — Microsoft Foundry, AWS Bedrock, Google Vertex AI, with the Google AI Studio vs Vertex AI distinction called out where it matters
- Agents — current dataset of managed agent platforms/services and open source frameworks
- Orchestration — current dataset of workflow engines and automation platforms
- Governance — current dataset of guardrails, safety controls, and policy tools
- Assistants — current dataset of coding copilots, productivity assistants, and build-your-own platforms

Every tool entry includes: official docs link, GitHub stars and version (open source), license with caveats noted, cloud availability, pricing summary, and current status (active, maintenance, archived).

## Design principles

- Source-backed or not published. Every claim links to an official source. If a data point cannot be verified, it is flagged or omitted.
- License accuracy matters. A tool labeled "MIT" that is actually source-available with commercial restrictions is a serious error, not a detail.
- Naming changes get tracked. Microsoft Foundry has been renamed three times since 2023. Amazon Q Developer was CodeWhisperer. Gemini Enterprise was Agentspace. This site uses current canonical names.
- Weekly updates focus on what matters. Acquisitions, deprecations, license changes, pricing changes, and regulatory developments come before patch releases.
- Data-dense over decorative. Inspired by Bloomberg Terminal and the CNCF Landscape. Zero marketing fluff.

## Data model

Core tracked data lives in:

- `data/platforms.json` — the three cloud foundation platforms
- `data/tools.json` — category tool records, metadata, and comparison attributes
- `data/updates.json` — weekly releases, deprecations, acquisitions, pricing changes, and other tracked market events

Schemas and field expectations are documented in `data/SCHEMA.md`.

## Update workflow

The normal update flow is:

1. Weekly research identifies source-backed changes across platforms and tracked tools
2. Proposed data changes are reviewed before application
3. Changes ship through pull requests, not direct production edits
4. The public updates feed reflects the approved changes once merged

See `AGENTS.md` for how the Radar automation agent handles weekly updates.

## Contribute

Contributions are welcome via pull request. The bar is simple: every data change must include a verifiable source URL.

Common contributions:
- Add a new tool: edit `data/tools.json` following `data/SCHEMA.md`
- Correct a data point: edit the relevant JSON file and include the source URL in the PR
- Add a weekly update: edit `data/updates.json` with a valid `sourceUrl`
- Report an error: open an issue with the source that proves the current data is wrong

## Tech stack

- Next.js (static export) + TypeScript + Tailwind CSS
- Data in JSON files (`data/tools.json`, `data/platforms.json`, `data/updates.json`)
- Deployed on Azure Static Web Apps
- No analytics, no cookies, no tracking

## Local development

```bash
npm ci
npm run dev
```

## Validation

```bash
npm run lint
npm run build
npm run check-seo-readiness
npm run check-deploy-readiness
```

## Deployment checks

```bash
npm run check-custom-domain-readiness
npm run check-live-performance -- https://www.enterpriseai.tools
npm run publish-preview
npm run smoke-test-live-site -- root https://www.enterpriseai.tools
```

Deployment and domain guides: `DEPLOYMENT.md` and `CUSTOM_DOMAIN.md`.

## Maintainer

Maintained by [Tiberiu Arva](https://www.linkedin.com/in/tiberiuarva/), an AI architect working in EU regulated financial services. The site is built by [Artix Cloud](https://www.artixcloud.com/).

## License

MIT. Fork it, run your own, contribute back if you find something worth fixing.
