# Databricks AI feature set and enterpriseai.tools fit

Checked: 2026-05-23

## Scope

This note records the minimum source-backed placement for Databricks in the tracker.

## Source-backed conclusions

### 1) Databricks clearly belongs in tracked adjacent categories now

Databricks now has defensible first-party coverage in multiple tracked categories:

- **Agents**: Databricks documents a Mosaic AI / agent framework stack with managed MCP servers, Vector Search retrieval, tool support, model serving, and MLflow-backed tracing/evaluation/monitoring.
  - Source: https://docs.databricks.com/aws/en/agents/gen-ai-capabilities
  - Source: https://docs.databricks.com/aws/en/generative-ai/agent-framework/agent-tool
  - Source: https://docs.databricks.com/aws/en/generative-ai/agent-framework/unstructured-retrieval-tools

- **Governance**: Unity AI Gateway is explicitly positioned as the central governance layer for agents, LLM endpoints, MCP servers, and coding agents, with permissions, audit logging, rate limits, and usage analysis.
  - Source: https://docs.databricks.com/aws/en/ai-gateway/

- **Orchestration**: Lakeflow Jobs is a real orchestration surface with jobs, tasks, triggers, DAGs, branching, loops, notifications, and job/task monitoring.
  - Source: https://docs.databricks.com/aws/en/jobs

- **Assistants**: Databricks AI assistive features now clearly include Genie Code and Genie Spaces.
  - Genie Code is the coding/pairing surface for SQL/Python/debugging and broader data work.
    - Source: https://docs.databricks.com/aws/en/genie-code/
    - Source: https://docs.databricks.com/aws/en/notebooks/code-assistant
  - Genie Spaces is the natural-language data assistant / business-insight surface.
    - Source: https://docs.databricks.com/aws/en/databricks-ai/

### 2) Databricks should not be forced into the current 3-cloud vendor comparison tables in the same slice

The current `/platforms` page and category comparison tables are intentionally hard-shaped around the three hyperscaler foundation clouds:

- Microsoft Foundry
- AWS Bedrock
- Google Vertex AI

That comparison framing is still coherent as a **cloud foundation layer** view.

Databricks is different:

- it is cross-cloud rather than a hyperscaler control plane;
- it overlaps the platform layer, but also competes directly in several adjacent category surfaces;
- adding it well requires a deliberate 4-vendor platform-page redesign instead of a rushed extra column.

### 3) Recommended website fit for now

For this slice, the honest placement is:

- add Databricks first-party tools into the adjacent category datasets now;
- keep the current three-way platform comparison intact for this run;
- treat future Databricks platform-page inclusion as a follow-up UX/data design task, not an implied yes/no shortcut.

## Notes on claim boundaries

- Avoid claiming broad protocol support for Databricks platform-wide unless a specific protocol claim is directly documented.
- Avoid overstating Genie Spaces as a general productivity copilot; it is closer to a governed natural-language data assistant.
- Avoid equating Lakeflow Jobs with a broad cross-SaaS automation platform; it is first and foremost Databricks-native workflow orchestration.
- Avoid inventing separate official product marks until the logo-provenance pass sources them cleanly.
