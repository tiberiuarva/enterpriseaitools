# Logo audit report

Generated from current repo data via `npm run report-logo-audit`. No wall-clock timestamp is embedded so diffs only reflect data/reporting changes.

## Site coverage by category

| Category | Total | Fallback | Service icon | Project logo | Official product | Official vendor |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| agents | 17 | 3 (18%) | 4 | 9 | 0 | 1 |
| orchestration | 12 | 1 (8%) | 5 | 5 | 0 | 1 |
| gateways | 7 | 7 (100%) | 0 | 0 | 0 | 0 |
| observability | 7 | 7 (100%) | 0 | 0 | 0 | 0 |
| control-planes | 7 | 7 (100%) | 0 | 0 | 0 | 0 |
| agent-identity | 10 | 10 (100%) | 0 | 0 | 0 | 0 |
| governance | 14 | 4 (29%) | 3 | 4 | 0 | 3 |
| assistants | 19 | 7 (37%) | 9 | 1 | 0 | 2 |
| always-on-agents | 8 | 8 (100%) | 0 | 0 | 0 | 0 |
| platforms | 3 | 0 (0%) | 3 | 0 | 0 | 0 |
| **All site records** | **104** | **54 (52%)** | **24** | **19** | **0** | **7** |

## Inventory status

- Inventory rows: **104**
- Classified: **104**
- Unclassified: **0**

## Source-surface mix

This shows where the currently rendered imagery comes from. Zero fallbacks does **not** mean the system is fully clean if many records still depend on shared vendor surfaces, GitHub-hosted docs/assets, docs-site assets, or vendor-site marks pulled from product/marketing pages. Fallback rows with no rendered source asset are tracked separately as `fallback-no-source`.

| Source surface | Count | Share |
| --- | ---: | ---: |
| icon-pack | 12 | 12% |
| repo | 7 | 7% |
| github-hosted | 2 | 2% |
| docs-site | 4 | 4% |
| vendor-site | 25 | 24% |
| fallback-no-source | 54 | 52% |
| other | 0 | 0% |

## Asset format mix

This tracks the rendered asset format. Fallback rows with no rendered image asset appear as `NO-ASSET` so the shares still sum to the full site dataset.

| Format | Count | Share |
| --- | ---: | ---: |
| NO-ASSET | 54 | 52% |
| SVG | 30 | 29% |
| PNG | 15 | 14% |
| JPG | 4 | 4% |
| AVIF | 1 | 1% |

## Shared-asset reuse

These rows are not automatically wrong, but they are where the system is still relying on family-brand or shared-platform reuse instead of distinct product marks.

- `/logos/databricks.png` → Databricks Mosaic AI Agent Framework (agents), Databricks Lakeflow Jobs (orchestration), Databricks Unity Gateway (governance), Databricks Genie Code (assistants), Databricks Genie Agents (assistants)
- `/logos/amazon-q.svg` → Amazon Q Developer (assistants), Amazon Q Business (assistants), Amazon Q Apps (assistants)
- `/logos/aws-bedrock.svg` → Amazon Bedrock Agents (agents), Amazon Bedrock Guardrails (governance)
- `/logos/gemini-shared.png` → Gemini for Workspace (assistants), Gemini Enterprise (assistants)
- `/logos/google-vertex-ai.svg` → Google Agent Builder + ADK (agents), Gemini Enterprise Agent Platform (platforms)
- `/logos/microsoft-foundry.jpg` → Microsoft Foundry Agent Service (agents), Microsoft Foundry (platforms)

## Review freshness

- Reviewed within the last 14 days of the inventory snapshot (2026-05-15): **97**
- Reviewed 15-30 days before the snapshot: **7**
- Reviewed more than 30 days before the snapshot: **0**

## Highest-priority cleanup signal

- Current worst category by fallback ratio: **agent-identity** with **10/10** fallback entries (100%).
- Treat this report as an audit gate: do not treat zero fallback count as full logo-system completion unless the source-surface mix, shared-asset reuse, and review freshness are also acceptable.

