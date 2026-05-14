# Logo provenance

This directory contains a mix of:
- primary-source vendor/project logo assets where public reuse in technical/architecture documentation is documented by the owner, and
- temporary generated placeholder badges for products where a defensible primary-source logo was not yet located.

## Primary-source replacements

These files were replaced from owner-controlled official asset pages or downloadable icon packs.

| Local file | Source |
| --- | --- |
| `azure-ai-content-safety.svg` | Microsoft Azure architecture icons: https://learn.microsoft.com/en-us/azure/architecture/icons/ (`Azure_Public_Service_Icons_V23.zip` → `03390-icon-service-Content-Safety.svg`) |
| `azure-logic-apps.svg` | Microsoft Azure architecture icons: https://learn.microsoft.com/en-us/azure/architecture/icons/ (`Azure_Public_Service_Icons_V23.zip` → `02631-icon-service-Logic-Apps.svg`) |
| `aws-bedrock.svg` | AWS Architecture Icons: https://aws.amazon.com/architecture/icons/ (`Icon-package_01302026.zip` → `Arch_Amazon-Bedrock_64.svg`) |
| `aws-step-functions.svg` | AWS Architecture Icons: https://aws.amazon.com/architecture/icons/ (`Icon-package_01302026.zip` → `Arch_AWS-Step-Functions_64.svg`) |
| `google-vertex-ai.svg` | Google Cloud official icon library: https://cloud.google.com/icons (`core-products-icons.zip` → `VertexAI-512-color.svg`) |
| `google-cloud-workflows.svg` | Google Cloud official legacy icon library: https://cloud.google.com/icons (`google-cloud-legacy-icons.zip` → `workflows.svg`) |
| `n8n.svg` | n8n brand guidelines: https://n8n.io/brandguidelines/ (`logo-dark.svg`) |
| `haystack.png` | Haystack official website homepage asset: https://haystack.deepset.ai/ (`/images/logos/haystack.png`); no separate public brand-kit page was found at review time. |
| `langflow.png` | Langflow official website homepage asset: https://www.langflow.org/ (`/images/logo.png`); no separate public brand-kit page was found at review time. |
| `dify.svg` | Dify brand guidelines on the official docs site: https://docs.dify.ai/en/resources/about-dify/dify-brand-guidelines (`d05cfc6ebe48f725d171dc71c64a5d16.svg`) |
| `crewai.svg` | CrewAI brand resource center: https://crewai.com/brand (`Logo.svg`) |
| `flowise.jpg` | Flowise official docs-site icon asset: https://docs.flowiseai.com/ (`Flowise Logo Dark High Res` via the owner-controlled GitBook image endpoint; GitBook currently serves the resized file as JPEG). |
| `llamaindex.svg` | LlamaIndex brand guidelines: https://www.llamaindex.ai/brand (`llamaindex-wordmark-black.svg`) |
| `mastra.png` | Mastra official homepage/brand asset: https://mastra.ai/ (`/brand/mastra-logo-wordmark.png`); the public rebrand post confirms this is the current logo system. |
| `beeai-framework.svg` | BeeAI Framework official docs-site logo: https://framework.beeai.dev/ (`beeai-framework-light.svg` served from the owner-controlled Mintlify CDN). |
| `langgraph.svg` | LangGraph official logo asset from the owner-controlled GitHub repo: https://github.com/langchain-ai/langgraph (`.github/images/logo-light.svg`). |
| `atomic-agents.png` | Atomic Agents official logo asset from the owner-controlled GitHub repo: https://github.com/BrainBlend-AI/atomic-agents (`.assets/logo.png`), committed here as an optimized downscaled copy for badge use. |
| `rivet.svg` | Rivet official app logo from the owner-controlled homepage: https://rivet.ironcladapp.com/ (`img/logo.svg`), intentionally rendered as a square service icon rather than a stretched project wordmark. |
| `llm-guard.png` | LLM Guard official docs-site logo asset from the owner-controlled Protect AI docs: https://protectai.github.io/llm-guard/ (`assets/logo.png`), post-acquisition. |
| `arthur-genai-engine.avif` | Arthur official homepage logo asset captured from https://www.arthur.ai/ after the January 2026 GenAI Engine rebrand (`arthur-logo-dark.avif` via the owner-controlled Webflow CDN). |
| `paperclip.svg` | Paperclip official homepage favicon/icon: https://paperclip.ing/favicon.svg, verified byte-for-byte against the live source on 2026-05-13 and rendered as a square service icon. |
| `copilot-studio.svg` | Copilot Studio official icon from the Microsoft Power Platform icons pack: https://learn.microsoft.com/en-us/power-platform/guidance/icons (`Power-Platform-icons-scalable.zip` → `CopilotStudio_scalable.svg`). |
| `microsoft-365-copilot.svg` | Microsoft Copilot official icon asset from the owner-controlled Microsoft 365 adoption site: https://adoption.microsoft.com/wp-content/uploads/2023/09/icon-copilot.svg, reused here for Microsoft 365 Copilot branding. |
| `gemini-shared.png` | Official Gemini product logo asset surfaced on the owner-controlled Google Workspace Gemini page: https://workspace.google.com/products/gemini/ (`https://www.gstatic.com/images/branding/productlogos/gemini_2025/v1/web-96dp/logo_gemini_2025_color_2x_web_96dp.png`). This shared Gemini mark is currently used for both `Gemini for Workspace` and `Gemini Enterprise`. |
| `cursor.svg` | Cursor official favicon/icon asset from the owner-controlled site: https://cursor.com/ (`/marketing-static/favicon.svg`). The checked-in copy is an intentionally normalized square-icon variant for site use (namespaced SVG ids / title added), so provenance is source-verified on 2026-05-14 but not byte-for-byte identical to the live file. |
| `windsurf.svg` | Windsurf official favicon/icon asset from the owner-controlled site: https://windsurf.com/ (`/favicon.svg`), intentionally kept as the vendor-provided square service icon because the public wordmark asset is white-only. The checked-in copy adds a `<title>` for accessibility, so provenance was rechecked against the live source on 2026-05-14 but is not byte-for-byte identical. The cream background tile is vendor-provided in the source asset. |
| `gemini-code-assist.png` | Gemini Code Assist official wordmark asset from the owner-controlled Code Assist for Business site: https://codeassist.google/products/business (`https://www.gstatic.com/cgc/codeassist/logo-gemini-code-assist-2025.png`), verified byte-for-byte against the live source on 2026-05-14. |

## Deliberately not force-replaced yet

Some current products do not have an obvious current primary-source standalone product mark in the checked official packs, or the available brand guidance is restrictive/ambiguous. Examples include GitHub Copilot product-specific artwork and several newer AI product variants.

Until a defensible official source is found, those files should remain placeholders rather than silently switching to third-party redraws or guessed marks.
