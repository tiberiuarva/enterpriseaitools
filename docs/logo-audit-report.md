# Logo audit report

Generated from current repo data via `npm run report-logo-audit`. No wall-clock timestamp is embedded so diffs only reflect data/reporting changes.

## Site coverage by category

| Category | Total | Fallback | Service icon | Project logo | Official product | Official vendor |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| agents | 13 | 0 (0%) | 4 | 9 | 0 | 0 |
| orchestration | 10 | 0 (0%) | 5 | 5 | 0 | 0 |
| governance | 9 | 0 (0%) | 3 | 4 | 0 | 2 |
| assistants | 11 | 0 (0%) | 10 | 1 | 0 | 0 |
| platforms | 3 | 0 (0%) | 3 | 0 | 0 | 0 |
| **All site records** | **46** | **0 (0%)** | **25** | **19** | **0** | **2** |

## Inventory status

- Inventory rows: **46**
- Classified: **46**
- Unclassified: **0**

## Source-surface mix

This shows where the currently rendered imagery comes from. Zero fallbacks does **not** mean the system is fully clean if many records still depend on shared vendor surfaces, GitHub-hosted docs/assets, docs-site assets, or vendor-site marks pulled from product/marketing pages.

| Source surface | Count | Share |
| --- | ---: | ---: |
| icon-pack | 12 | 26% |
| repo | 7 | 15% |
| github-hosted | 1 | 2% |
| docs-site | 3 | 7% |
| vendor-site | 23 | 50% |
| other | 0 | 0% |

## Asset format mix

| Format | Count | Share |
| --- | ---: | ---: |
| SVG | 31 | 67% |
| PNG | 10 | 22% |
| JPG | 4 | 9% |
| AVIF | 1 | 2% |

## Shared-asset reuse

These rows are not automatically wrong, but they are where the system is still relying on family-brand or shared-platform reuse instead of distinct product marks.

- `/logos/amazon-q.svg` → Amazon Q Developer (assistants), Amazon Q Business (assistants), Amazon Q Apps (assistants)
- `/logos/aws-bedrock.svg` → AWS Bedrock Agents (agents), AWS Bedrock Guardrails (governance)
- `/logos/gemini-shared.png` → Gemini for Workspace (assistants), Gemini Enterprise (assistants)
- `/logos/google-vertex-ai.svg` → Google Agent Builder + ADK (agents), Google Vertex AI (platforms)
- `/logos/microsoft-foundry.jpg` → Microsoft Foundry Agent Service (agents), Microsoft Foundry (platforms)

## Review freshness

- Reviewed within the last 14 days of the inventory snapshot (2026-05-15): **39**
- Reviewed 15-30 days before the snapshot: **7**
- Reviewed more than 30 days before the snapshot: **0**

## Highest-priority cleanup signal

- Fallback share is currently **0%**, so the next honest cleanup signal is source quality: **23** vendor-site marks, **1** GitHub-hosted marks, **3** docs-site marks, and **5** shared-image reuse groups still need periodic review.
- Treat this report as an audit gate: do not treat zero fallback count as full logo-system completion unless the source-surface mix and shared-asset reuse are also acceptable.

