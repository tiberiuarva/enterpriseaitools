# Category expansion research — 2026-09-30

Provenance log for the 53 records added in the 2026-09-30 category expansion (milestone 9), so the sweep can be repeated. Every governance claim's own `sourceUrl` lives on the record in `data/tools.json`; this note lists each record's primary documentation, repository, and the distinct sources behind its governance posture.

## Method

- Each record was built from primary sources opened during research (vendor docs, announcements, pricing and trust pages, GitHub repositories and LICENSE files). Search snippets and press coverage were not accepted.
- Facts that could not be verified were left out, or recorded as governance status `unknown` with the reason in `detail`.
- `githubStars` is omitted on all new records: the GitHub REST API was unreachable from the research environment, and the repository pages only show rounded counts. The next Radar run with API access should fill them in.
- All new records use `logoKind: fallback`; no logo asset could be downloaded and reviewed.

## Left out (no primary source reachable)

| Product | Intended hub | Why |
|---|---|---|
| OpenAI Frontier | control-planes | openai.com returned 403 to every fetch |
| ChatGPT Dots | always-on-agents | openai.com and help.openai.com returned 403 |
| Perplexity Computer | always-on-agents | every perplexity.ai page returned 403 |
| Microsoft Foundry Control Plane | control-planes | not a separate product or SKU; it is a pane of Foundry |

## Records

### `agents`

- **Claude Agent SDK** (`claude-agent-sdk`) — license `MIT (SDK wrapper); Proprietary (bundled Claude Code)`; docs: https://code.claude.com/docs/en/agent-sdk/overview; repo: https://github.com/anthropics/claude-agent-sdk-python
  - governance: https://code.claude.com/docs/en/agent-sdk/overview
  - governance: https://code.claude.com/docs/en/agent-sdk/quickstart
- **Pydantic AI** (`pydantic-ai`) — license `MIT`; docs: https://pydantic.dev/docs/ai/overview/; repo: https://github.com/pydantic/pydantic-ai
  - governance: https://github.com/pydantic/pydantic-ai
  - governance: https://pydantic.dev/docs/ai/overview/
  - governance: https://raw.githubusercontent.com/pydantic/pydantic-ai/main/LICENSE
- **Strands Agents** (`strands-agents`) — license `Apache 2.0`; docs: https://strandsagents.com/; repo: https://github.com/strands-agents/harness-sdk
  - governance: https://github.com/strands-agents/harness-sdk
  - governance: https://raw.githubusercontent.com/strands-agents/harness-sdk/main/LICENSE.APACHE

### `orchestration`

- **Temporal** (`temporal`) — license `MIT`; docs: https://docs.temporal.io/ai; repo: https://github.com/temporalio/temporal
  - governance: https://docs.temporal.io/cloud/audit-logging
  - governance: https://docs.temporal.io/cloud/regions
  - governance: https://raw.githubusercontent.com/temporalio/temporal/main/LICENSE
  - governance: https://temporal.io/pricing
  - governance: https://temporal.io/security

### `gateways`

- **agentgateway** (`agentgateway`) — license `Apache 2.0`; docs: https://agentgateway.dev/docs/; repo: https://github.com/agentgateway/agentgateway
  - governance: https://agentgateway.dev/docs/
  - governance: https://github.com/agentgateway/agentgateway/releases/tag/v1.5.0
  - governance: https://raw.githubusercontent.com/agentgateway/agentgateway/main/LICENSE
- **Azure API Management AI gateway** (`azure-apim-ai-gateway`) — license `Proprietary`; docs: https://learn.microsoft.com/en-us/azure/api-management/genai-gateway-capabilities
  - governance: https://learn.microsoft.com/en-us/azure/api-management/genai-gateway-capabilities
  - governance: https://learn.microsoft.com/en-us/azure/api-management/self-hosted-gateway-overview
  - governance: https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-iso-27001
  - governance: https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-soc-2
- **Cloudflare AI Gateway** (`cloudflare-ai-gateway`) — license `Proprietary`; docs: https://developers.cloudflare.com/ai-gateway/
  - governance: https://developers.cloudflare.com/ai-gateway/
  - governance: https://developers.cloudflare.com/ai-gateway/observability/logging/
  - governance: https://developers.cloudflare.com/ai-gateway/reference/pricing/
  - governance: https://www.cloudflare.com/trust-hub/compliance-resources/iso-certifications/
  - governance: https://www.cloudflare.com/trust-hub/compliance-resources/soc-2/
- **Docker MCP Gateway** (`docker-mcp-gateway`) — license `MIT`; docs: https://docs.docker.com/ai/mcp-gateway/; repo: https://github.com/docker/mcp-gateway
  - governance: https://docs.docker.com/ai/mcp-gateway/
  - governance: https://github.com/docker/mcp-gateway
  - governance: https://raw.githubusercontent.com/docker/mcp-gateway/main/LICENSE
- **Kong AI Gateway** (`kong-ai-gateway`) — license `Proprietary`; docs: https://developer.konghq.com/ai-gateway/; repo: https://github.com/Kong/kong
  - governance: https://developer.konghq.com/ai-gateway/
  - governance: https://developer.konghq.com/ai-gateway/ai-audit-log-reference/
  - governance: https://developer.konghq.com/konnect-platform/geos/
  - governance: https://developer.konghq.com/plugins/ai-proxy-advanced/
- **LiteLLM** (`litellm`) — license `MIT core + EE paths`; docs: https://docs.litellm.ai/; repo: https://github.com/BerriAI/litellm
  - governance: https://docs.litellm.ai/
  - governance: https://docs.litellm.ai/docs/data_security
  - governance: https://github.com/BerriAI/litellm
  - governance: https://raw.githubusercontent.com/BerriAI/litellm/main/LICENSE
- **Portkey AI Gateway** (`portkey-ai-gateway`) — license `MIT`; docs: https://portkey.ai/docs; repo: https://github.com/Portkey-AI/gateway
  - governance: https://portkey.ai/docs
  - governance: https://portkey.ai/docs/product/enterprise-offering/audit-logs
  - governance: https://portkey.ai/pricing
  - governance: https://raw.githubusercontent.com/Portkey-AI/gateway/main/LICENSE

### `observability`

- **Arize Phoenix** (`arize-phoenix`) — license `Elastic License 2.0`; docs: https://arize.com/docs/phoenix; repo: https://github.com/Arize-ai/phoenix
  - governance: https://arize.com/docs/phoenix
  - governance: https://raw.githubusercontent.com/Arize-ai/phoenix/main/LICENSE
- **Braintrust** (`braintrust`) — license `Proprietary`; docs: https://www.braintrust.dev/docs
  - governance: https://www.braintrust.dev/docs/guides/self-hosting
  - governance: https://www.braintrust.dev/docs/security
  - governance: https://www.braintrust.dev/pricing
- **Datadog Agent Observability** (`datadog-agent-observability`) — license `Proprietary`; docs: https://docs.datadoghq.com/llm_observability/
  - governance: https://docs.datadoghq.com/account_management/audit_trail/
  - governance: https://docs.datadoghq.com/getting_started/site/
  - governance: https://docs.datadoghq.com/llm_observability/
  - governance: https://trust.datadoghq.com/
  - governance: https://www.datadoghq.com/pricing/list/
- **Langfuse** (`langfuse`) — license `MIT core + EE paths`; docs: https://langfuse.com/docs; repo: https://github.com/langfuse/langfuse
  - governance: https://langfuse.com/pricing
  - governance: https://langfuse.com/security
  - governance: https://langfuse.com/security/iso27001
  - governance: https://langfuse.com/security/soc2
  - governance: https://langfuse.com/self-hosting
  - governance: https://raw.githubusercontent.com/langfuse/langfuse/main/LICENSE
- **LangSmith** (`langsmith`) — license `Proprietary`; docs: https://docs.langchain.com/langsmith/observability
  - governance: https://docs.langchain.com/langsmith/audit-logs
  - governance: https://docs.langchain.com/langsmith/cloud
  - governance: https://docs.langchain.com/langsmith/self-hosted
  - governance: https://www.langchain.com/pricing
- **MLflow** (`mlflow`) — license `Apache 2.0`; docs: https://mlflow.org/docs/latest/genai/; repo: https://github.com/mlflow/mlflow
  - governance: https://mlflow.org/docs/latest/genai/
  - governance: https://mlflow.org/docs/latest/genai/tracing/
  - governance: https://raw.githubusercontent.com/mlflow/mlflow/master/LICENSE.txt
- **Opik** (`opik`) — license `Apache 2.0`; docs: https://www.comet.com/docs/opik/quickstart; repo: https://github.com/comet-ml/opik
  - governance: https://raw.githubusercontent.com/comet-ml/opik/main/LICENSE
  - governance: https://trust.comet.com/
  - governance: https://www.comet.com/docs/opik/self-host/overview

### `control-planes`

- **Amazon Bedrock AgentCore** (`amazon-bedrock-agentcore`) — license `Proprietary`; docs: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/release-notes.html
  - governance: https://aws.amazon.com/bedrock/agentcore/pricing/
  - governance: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/compliance-validation.html
  - governance: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/registry-cloudtrail.html
  - governance: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/release-notes.html
- **IBM watsonx Orchestrate** (`ibm-watsonx-orchestrate`) — license `Proprietary`; docs: https://www.ibm.com/docs/en/watsonx/watson-orchestrate/base
  - governance: https://www.ibm.com/docs/en/watsonx/watson-orchestrate/base
  - governance: https://www.ibm.com/new/announcements/introducing-the-agentic-control-plane
  - governance: https://www.ibm.com/products/watsonx-orchestrate/pricing
- **Kore.ai Agent Management Platform** (`kore-ai-agent-management-platform`) — license `Proprietary`; docs: https://www.kore.ai/news/kore-ai-launches-agent-management-platform
  - governance: https://trust.kore.ai/
  - governance: https://www.kore.ai/news/kore-ai-launches-agent-management-platform
- **Microsoft Agent 365** (`microsoft-agent-365`) — license `Proprietary`; docs: https://learn.microsoft.com/en-us/microsoft-agent-365/overview
  - governance: https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-42001
  - governance: https://learn.microsoft.com/en-us/microsoft-agent-365/overview
  - governance: https://learn.microsoft.com/en-us/purview/audit-log-activities
  - governance: https://www.microsoft.com/microsoft-agent-365
- **MuleSoft Agent Fabric** (`mulesoft-agent-fabric`) — license `Proprietary`; docs: https://docs.mulesoft.com/general/agent-fabric-overview
  - governance: https://docs.mulesoft.com/general/agent-fabric-overview
  - governance: https://docs.mulesoft.com/hosting-home/
- **ServiceNow AI Control Tower** (`servicenow-ai-control-tower`) — license `Proprietary`; docs: https://www.servicenow.com/docs/r/intelligent-experiences/ai-control-tower/ai-control-tower-home-page.html
  - governance: https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-expands-AI-Control-Tower-to-discover-observe-govern-secure-and-measure-AI-deployed-across-any-system-in-the-enterprise/default.aspx
  - governance: https://www.servicenow.com/docs/r/intelligent-experiences/ai-control-tower/ai-control-tower-home-page.html
- **Workday Agent System of Record** (`workday-agent-system-of-record`) — license `Proprietary`; docs: https://www.workday.com/en-us/artificial-intelligence/agent-system-of-record.html
  - governance: https://blog.workday.com/en-us/managing-ai-powered-future-of-work.html
  - governance: https://www.workday.com/en-us/artificial-intelligence/agent-system-of-record.html
  - governance: https://www.workday.com/en-us/why-workday/trust/compliance.html

### `agent-identity`

- **Aembit IAM for Agentic AI** (`aembit-iam-for-agentic-ai`) — license `Proprietary`; docs: https://docs.aembit.io/
  - governance: https://aembit.io/blog/aembit-achieves-iso-27001-certification/
  - governance: https://aembit.io/blog/aembit-iam-for-agentic-ai-is-now-generally-available/
  - governance: https://aembit.io/pricing/
- **Auth0 for AI Agents** (`auth0-for-ai-agents`) — license `Proprietary`; docs: https://auth0.com/ai/docs
  - governance: https://auth0.com/blog/auth0-for-ai-agents-generally-available/
  - governance: https://auth0.com/pricing
  - governance: https://security.okta.com/
- **Descope Agentic Identity Hub** (`descope-agentic-identity-hub`) — license `Proprietary`; docs: https://docs.descope.com/agentic-identity-hub
  - governance: https://docs.descope.com/agentic-identity-hub
  - governance: https://www.descope.com/pricing
  - governance: https://www.descope.com/security-compliance
- **Google Agent Identity** (`google-agent-identity`) — license `Proprietary`; docs: https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/agent-identity-overview
  - governance: https://cloud.google.com/security/compliance/services-in-scope
  - governance: https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/agent-identity-overview
- **Idira Secure AI Agents** (`idira-secure-ai-agents`) — license `Proprietary`; docs: https://www.paloaltonetworks.com/idira
  - governance: https://www.paloaltonetworks.com/blog/identity-security/securing-claude-ai-agents-idira/
  - governance: https://www.paloaltonetworks.com/idira
- **Microsoft Entra Agent ID** (`microsoft-entra-agent-id`) — license `Proprietary`; docs: https://learn.microsoft.com/en-us/entra/agent-id/what-is-microsoft-entra-agent-id
  - governance: https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-42001
  - governance: https://learn.microsoft.com/en-us/compliance/regulatory/offering-soc-2
  - governance: https://learn.microsoft.com/en-us/entra/agent-id/what-is-microsoft-entra-agent-id
  - governance: https://learn.microsoft.com/en-us/entra/fundamentals/licensing
- **Okta for AI Agents** (`okta-for-ai-agents`) — license `Proprietary`; docs: https://help.okta.com/oie/en-us/content/topics/ai-agents/ai-agents-home.htm
  - governance: https://help.okta.com/oie/en-us/content/topics/ai-agents/ai-agents-home.htm
  - governance: https://security.okta.com/
  - governance: https://www.okta.com/blog/ai/okta-for-ai-agents-general-availability/
  - governance: https://www.okta.com/newsroom/press-releases/okta-brings-first-class-identity-to-ai-agents-with-agent-sso/
- **Ping Identity for AI** (`ping-identity-for-ai`) — license `Proprietary`; docs: https://developer.pingidentity.com/identity-for-ai/
  - governance: https://press.pingidentity.com/2026-03-24-Ping-Identity-Defines-the-Runtime-Identity-Standard-for-Autonomous-AI
  - governance: https://www.pingidentity.com/en/legal/trust-center.html
- **SailPoint Agent Identity Security** (`sailpoint-agent-identity-security`) — license `Proprietary`; docs: https://documentation.sailpoint.com/saas/help/agent/index.html
  - governance: https://www.sailpoint.com/products/agent-identity-security
  - governance: https://www.sailpoint.com/why-us/trust/cybersecurity
- **Saviynt Zuma** (`saviynt-zuma`) — license `Proprietary`; docs: https://saviynt.com/products/identity-security-for-ai
  - governance: https://saviynt.com/products/identity-security-for-ai
  - governance: https://saviynt.com/trust-compliance-security

### `governance`

- **Microsoft Purview Data Security Posture Management** (`microsoft-purview-dspm`) — license `Proprietary`; docs: https://learn.microsoft.com/en-us/purview/data-security-posture-management-learn-about
  - governance: https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-27001
  - governance: https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-42001
  - governance: https://learn.microsoft.com/en-us/compliance/regulatory/offering-soc-2
  - governance: https://learn.microsoft.com/en-us/purview/ai-microsoft-purview
  - governance: https://learn.microsoft.com/en-us/purview/data-security-posture-management-get-started
  - governance: https://learn.microsoft.com/en-us/purview/data-security-posture-management-learn-about
- **NVIDIA NemoClaw** (`nvidia-nemoclaw`) — license `Apache 2.0`; docs: https://docs.nvidia.com/nemoclaw/latest/; repo: https://github.com/NVIDIA/NemoClaw
  - governance: https://docs.nvidia.com/nemoclaw/latest/
  - governance: https://raw.githubusercontent.com/NVIDIA/NemoClaw/main/LICENSE
- **Prisma AIRS** (`prisma-airs`) — license `Proprietary`; docs: https://docs.paloaltonetworks.com/ai-runtime-security
  - governance: https://docs.paloaltonetworks.com/ai-runtime-security/activation-and-onboarding/prisma-airs-supported-regions
  - governance: https://www.paloaltonetworks.com/prisma/prisma-ai-runtime-security
- **Zenity** (`zenity`) — license `Proprietary`; docs: https://zenity.io/platform
  - governance: https://zenity.io/company/trust-center
  - governance: https://zenity.io/platform
  - governance: https://zenity.io/use-cases/business-needs/ai-agents-compliance

### `assistants`

- **ChatGPT Enterprise** (`chatgpt-enterprise`) — license `Proprietary`; docs: https://learn.chatgpt.com/docs/enterprise/admin-setup
  - governance: https://learn.chatgpt.com/docs/enterprise/admin-setup
  - governance: https://learn.chatgpt.com/docs/enterprise/chatgpt-work-cloud-security
  - governance: https://learn.chatgpt.com/docs/enterprise/compliance-api
  - governance: https://learn.chatgpt.com/docs/pricing
  - governance: https://trust.openai.com
- **Claude Code** (`claude-code`) — license `Proprietary`; docs: https://code.claude.com/docs/; repo: https://github.com/anthropics/claude-code
  - governance: https://code.claude.com/docs/en/monitoring-usage
  - governance: https://code.claude.com/docs/en/third-party-integrations
  - governance: https://github.com/anthropics/claude-code/blob/main/LICENSE.md
  - governance: https://privacy.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained
- **Claude Enterprise** (`claude-enterprise`) — license `Proprietary`; docs: https://support.claude.com/en/articles/9797531-what-is-the-enterprise-plan
  - governance: https://claude.com/pricing
  - governance: https://claude.com/solutions/enterprise
  - governance: https://privacy.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained
  - governance: https://support.claude.com/en/articles/9797531-what-is-the-enterprise-plan
- **Google Antigravity** (`google-antigravity`) — license `Proprietary`; docs: https://antigravity.google/docs/home/
  - governance: https://antigravity.google/docs/enterprise
  - governance: https://antigravity.google/docs/plans
- **Kiro** (`kiro`) — license `Proprietary`; docs: https://kiro.dev/docs/
  - governance: https://kiro.dev/docs/
  - governance: https://kiro.dev/docs/enterprise/monitor-and-track/
  - governance: https://kiro.dev/docs/privacy-and-security/compliance-validation/
  - governance: https://kiro.dev/docs/privacy-and-security/data-protection/
  - governance: https://kiro.dev/pricing
- **OpenAI Codex** (`openai-codex`) — license `Apache 2.0 (CLI); Proprietary (cloud)`; docs: https://learn.chatgpt.com/docs; repo: https://github.com/openai/codex
  - governance: https://github.com/openai/codex/blob/main/LICENSE
  - governance: https://learn.chatgpt.com/docs/enterprise/admin-setup
  - governance: https://learn.chatgpt.com/docs/enterprise/chatgpt-work-cloud-security
  - governance: https://learn.chatgpt.com/docs/enterprise/compliance-api
  - governance: https://trust.openai.com

### `always-on-agents`

- **Gemini Spark** (`gemini-spark`) — license `Proprietary`; docs: https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/
  - governance: https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/
- **Grok Bot** (`grok-bot`) — license `Proprietary`; docs: https://x.ai/news/introducing-grok-bot
  - governance: https://x.ai/news/grok-bot-more-plans
  - governance: https://x.ai/news/introducing-grok-bot
- **Hermes Agent** (`hermes-agent`) — license `MIT`; docs: https://hermes-agent.nousresearch.com/docs/; repo: https://github.com/NousResearch/hermes-agent
  - governance: https://github.com/NousResearch/hermes-agent/blob/main/LICENSE
  - governance: https://hermes-agent.nousresearch.com/docs/
- **Manus** (`manus`) — license `Proprietary`; docs: https://manus.im/docs
  - governance: https://manus.im/blog/manus-my-computer-desktop
  - governance: https://manus.im/team
- **Muse** (`meta-muse`) — license `Proprietary`; docs: https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/
  - governance: https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/
- **Microsoft Autopilot** (`microsoft-autopilot`) — license `Proprietary`; docs: https://www.microsoft.com/en-us/copilot/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/
  - governance: https://blogs.microsoft.com/blog/2026/09/25/introducing-the-new-copilot-with-home-code-and-autopilot/
  - governance: https://www.microsoft.com/en-us/copilot/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/
- **NanoClaw** (`nanoclaw`) — license `MIT`; docs: https://docs.nanoclaw.dev; repo: https://github.com/nanocoai/nanoclaw
  - governance: https://docs.nanoclaw.dev
  - governance: https://github.com/nanocoai/nanoclaw
  - governance: https://github.com/nanocoai/nanoclaw/blob/main/LICENSE
- **OpenClaw** (`openclaw`) — license `MIT`; docs: https://docs.openclaw.ai; repo: https://github.com/openclaw/openclaw
  - governance: https://docs.openclaw.ai/gateway/security
  - governance: https://openclaw.ai
  - governance: https://raw.githubusercontent.com/openclaw/openclaw/main/LICENSE
