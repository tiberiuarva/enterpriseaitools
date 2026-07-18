# License-history backfill — research record (2026-07-17)

Milestone 5 backfill sweep across all 48 tracked tools, searching for verifiable
license *transitions*. Only events with a resolving primary source were recorded
in `data/tools.json` (`licenseHistory`); everything else is documented here so
the sweep is auditable and repeatable.

## Events recorded (source-verified)

| Tool | Date | Transition | Direction | Source |
|---|---|---|---|---|
| n8n | 2022-03-17 | Apache 2.0 + Commons Clause → Sustainable Use License | open | n8n blog announcement |
| flowise | 2023-09-08 | MIT → Apache 2.0 | restrictive (minor, both permissive) | LICENSE.md commit history |
| mastra | 2026-03-03 | Apache 2.0 → Apache 2.0 core + EE paths | restrictive | mastra PR #13163 + changelog |

## Checked, no change found

crewai, autogen, llamaindex, semantic-kernel, microsoft-agent-framework,
langgraph, openai-agents-sdk, atomic-agents, llm-guard, nemo-guardrails —
license constant since inception per repo history. beeai-framework held
Apache 2.0 through the Bee → BeeAI rename and IBM → Linux Foundation move
(governance change, not a license change). langflow OSS remains MIT
(DataStax's BUSL-licensed RAGStack Langflow is a different product, not the
tracked repo). rebuff's Apache 2.0 never changed (its archival on 2025-05-16
is already reflected in `status`).

## Checked, unverifiable as a change — deliberately NOT recorded

- **n8n (earlier transition):** Apache 2.0 → Apache 2.0 + Commons Clause
  happened before 2019-10-08 (upper bound: n8n-io/n8n issue #40), but no
  primary source pins the actual date. Omitted rather than guessed.
- **dify:** the custom "Dify Open Source License" text is present from the
  earliest visible LICENSE commit (2023-05-15); no confirmed prior
  plain-Apache-2.0 state, so there is no verifiable *transition* to record.
- **rivet, haystack, paperclip:** no change record found in the time
  available; not exhaustively verified.

## Flags routed elsewhere

- **guardrails-ai:** tracked label `MIT` vs upstream Apache-2.0 — already
  filed as data-correction issue #110; license fields are never edited
  outside that flow.

Future events are captured going forward by the weekly snapshot diff (license
drift is flagged high-impact) plus the `/radar` license-change workflow, so
this manual sweep should not need repeating — only extending when new tools
are added.
