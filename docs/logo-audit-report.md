# Logo audit report

Generated from current repo data via `npm run report-logo-audit`. No wall-clock timestamp is embedded so diffs only reflect data/reporting changes.

## Site coverage by category

| Category | Total | Fallback | Service icon | Project logo | Official product | Official vendor |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| agents | 14 | 1 (7%) | 4 | 9 | 0 | 0 |
| orchestration | 11 | 1 (9%) | 5 | 5 | 0 | 0 |
| governance | 10 | 1 (10%) | 3 | 4 | 0 | 2 |
| assistants | 13 | 2 (15%) | 10 | 1 | 0 | 0 |
| platforms | 3 | 0 (0%) | 3 | 0 | 0 | 0 |
| **All site records** | **51** | **5 (10%)** | **25** | **19** | **0** | **2** |

## Inventory status

- Inventory rows: **51**
- Classified: **51**
- Unclassified: **0**

## Source-surface mix

This shows where the currently rendered imagery comes from. Zero fallbacks does **not** mean the system is fully clean if many records still depend on shared vendor surfaces, GitHub-hosted docs/assets, docs-site assets, or vendor-site marks pulled from product/marketing pages.

| Source surface | Count | Share |
| --- | ---: | ---: |
| icon-pack | 12 | 24% |
| repo | 7 | 14% |
| github-hosted | 2 | 4% |
| docs-site | 4 | 8% |
| vendor-site | 21 | 41% |
| other | 5 | 10% |

## Asset format mix

| Format | Count | Share |
| --- | ---: | ---: |
| SVG | 31 | 61% |
| PNG | 10 | 20% |
| NONE | 5 | 10% |
| JPG | 4 | 8% |
| AVIF | 1 | 2% |

## Shared-asset reuse

These rows are not automatically wrong, but they are where the system is still relying on family-brand or shared-platform reuse instead of distinct product marks.

- `undefined` → Databricks Mosaic AI Agent Framework (agents), Databricks Lakeflow Jobs (orchestration), Databricks Unity AI Gateway (governance), Genie Code (assistants), Genie Spaces (assistants)
- `/logos/amazon-q.svg` → Amazon Q Developer (assistants), Amazon Q Business (assistants), Amazon Q Apps (assistants)
- `/logos/aws-bedrock.svg` → AWS Bedrock Agents (agents), AWS Bedrock Guardrails (governance)
- `/logos/gemini-shared.png` → Gemini for Workspace (assistants), Gemini Enterprise (assistants)
- `/logos/google-vertex-ai.svg` → Google Agent Builder + ADK (agents), Google Vertex AI (platforms)
- `/logos/microsoft-foundry.jpg` → Microsoft Foundry Agent Service (agents), Microsoft Foundry (platforms)

## Review freshness

- Reviewed within the last 14 days of the inventory snapshot (2026-05-15): **44**
- Reviewed 15-30 days before the snapshot: **7**
- Reviewed more than 30 days before the snapshot: **0**

## Highest-priority cleanup signal

- Current worst category by fallback ratio: **assistants** with **2/13** fallback entries (15%).
- Treat this report as an audit gate: do not treat zero fallback count as full logo-system completion unless the source-surface mix, shared-asset reuse, and review freshness are also acceptable.

