# Data schema

All site data lives under `/data/` and renders statically in v1.

## `tools.json`

Top-level shape:

```json
{
  "lastUpdated": "2026-04-11",
  "tools": []
}
```

### Tool object fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | string | yes | Unique slug, e.g. `semantic-kernel` |
| `name` | string | yes | Display name |
| `category` | `agents \| orchestration \| governance \| assistants` | yes | Primary category |
| `subcategory` | string | no | Used mainly for assistants (`coding`, `productivity`, `build-your-own`) |
| `type` | `vendor \| opensource \| commercial` | yes | Rendering and filtering type |
| `vendor` | string | no | Parent company or maintainer |
| `description` | string | yes | One sentence, max 150 chars target |
| `strengths` | string[] | yes | 2-3 short strengths |
| `practitionerNote` | string | no | Concise editorial implementation note grounded in the tool's deployment fit, trade-offs, or enterprise usage pattern |
| `clouds` | string[] | no | Any of `azure`, `aws`, `gcp` when the tool is meaningfully cloud-specific in the tracker UI |
| `cloudBadgeReviewedAt` | string | no | Calendar ISO date (`YYYY-MM-DD`) for an explicit cloud-badge review when the tool is intentionally left cloud-neutral |
| `license` | string | yes | Exact license label |
| `licenseWarning` | string | no | Caveat for source-available, proprietary core, branding, etc. |
| `githubUrl` | string | no | Official repository URL |
| `githubStars` | number | no | Open source star count only when verified |
| `version` | string | no | Current stable version |
| `lastRelease` | string | no | ISO date |
| `publishedAt` | string | no | ISO date the per-tool page was first published. Drives the Article JSON-LD `datePublished` for tools added after the initial site launch; pages omit it for tools present at launch and the per-tool page falls back to the site launch date. |
| `docsUrl` | string | yes | Official docs URL |
| `websiteUrl` | string | no | Marketing/product URL if distinct |
| `pricing` | string | no | Human-readable pricing summary |
| `pricingModel` | `free \| freemium \| paid \| contact` | no | Coarse pricing bucket |
| `languages` | string[] | no | Supported implementation languages |
| `status` | `active \| maintenance \| deprecated \| archived` | yes | Current lifecycle state |
| `statusNote` | string | no | Explanation for non-active states |
| `logoUrl` | string | no | Relative asset path under `/public/logos/`; use only for reviewed image kinds (`official-product`, `official-vendor`, `service-icon`, `project-logo`). Omit for `fallback`. |
| `logoKind` | `official-product \| official-vendor \| service-icon \| project-logo \| fallback` | yes | Explicit render classification required for every site record |
| `logoSourceUrl` | string | no* | Primary source URL for provenance. Required for non-`fallback` kinds, must be absent for `logoKind: fallback`. |
| `logoNotes` | string | no | Audit note for ambiguity or fallback rationale |
| `logoReviewedAt` | string | yes | Calendar ISO date (`YYYY-MM-DD`) when logo provenance was last checked. Required for every site record. |
| `tags` | string[] | no | Search/filter helpers |
| `governance` | object | yes | Governance posture — see "Tool governance object" below. Required on every tool. |

### Tool governance object (`tool.governance`)

Drives the governance-posture comparison (grid filters/columns + per-tool page). Every
tool carries all dimensions; a value is either **source-backed** or explicitly
**`not-applicable` / `unknown` with a reason** — never guessed.

Each dimension is a `GovernanceClaim`: `{ status, detail, sourceUrl?, sourceTitle? }`.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `dataResidency` | GovernanceClaim | yes | Can the customer control where data is stored/processed? |
| `deployment` | GovernanceClaim + `models` | yes | `models`: array of `saas \| self-hosted \| on-prem \| sovereign \| hybrid` |
| `auditLogging` | GovernanceClaim | yes | Native audit/access logs available? |
| `soc2` | GovernanceClaim | yes | SOC 2 Type II attestation |
| `iso27001` | GovernanceClaim | yes | ISO/IEC 27001 certification |
| `iso42001` | GovernanceClaim | yes | ISO/IEC 42001 (AI management system) certification |
| `euAiAct` | GovernanceClaim + `role` | yes | `role`: `prohibited \| high-risk \| limited-risk \| minimal-risk \| not-applicable \| unknown` |
| `licenseRisk` | GovernanceClaim + `level` | yes | `level`: `low \| medium \| high \| unknown` |
| `reviewedAt` | string | yes | Calendar ISO date (`YYYY-MM-DD`) of the governance review |

`GovernanceClaim.status` is one of `yes \| partial \| no \| not-applicable \| unknown`.

**Rules (enforced by `scripts/check-governance-data.mjs`):**
- Every dimension present on every tool; `detail` non-empty.
- When `status` is `yes`, `partial`, or `no` (an asserted fact), `sourceUrl` is **required**
  and must be an absolute URL.
- When `status` is `not-applicable` or `unknown`, `detail` must state the reason; `sourceUrl`
  is optional.
- Self-hosted open-source libraries are `not-applicable` for `soc2`/`iso27001`/`iso42001`
  (certification applies to the operator, not the package) with that reason in `detail`.
- `licenseRisk.level` reflects license type, not the `license` label itself; never edit the
  `license` field here — license corrections go through a dedicated data-correction issue.

## `platforms.json`

Top-level shape:

```json
{
  "platforms": []
}
```

### Platform object fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | string | yes | Unique slug like `microsoft-foundry` |
| `name` | string | yes | Current canonical name |
| `formerNames` | string[] | yes | Prior names or naming cautions |
| `vendor` | string | yes | `Microsoft`, `AWS`, or `Google` |
| `description` | string | yes | One-sentence description |
| `modelCount` | string | yes | Human-readable count like `11,000+` |
| `sdkLanguages` | string[] | yes | Supported SDK languages |
| `protocols` | string[] | yes | Supported protocols |
| `pricing` | string | yes | Pricing summary |
| `freeTier` | string | yes | Credit/free-tier summary |
| `onPremises` | string | yes | On-premises or sovereign note |
| `regions` | string | yes | Region / residency summary |
| `compliance` | string[] | yes | Compliance badges or standards |
| `docsUrl` | string | yes | Official docs URL |
| `websiteUrl` | string | no | Product page |
| `lastUpdated` | string | yes | ISO date |
| `tagline` | string | yes | Homepage platforms strip line |
| `logoUrl` | string | no | Relative asset path under `/public/logos/`; use only for reviewed image kinds (`official-product`, `official-vendor`, `service-icon`, `project-logo`). Omit for `fallback`. |
| `logoKind` | `official-product \| official-vendor \| service-icon \| project-logo \| fallback` | yes | Explicit render classification required for every site record |
| `logoSourceUrl` | string | no* | Primary source URL for provenance. Required for non-`fallback` kinds, must be absent for `logoKind: fallback`. |
| `logoNotes` | string | no | Audit note for ambiguity or fallback rationale |
| `logoReviewedAt` | string | yes | Calendar ISO date (`YYYY-MM-DD`) when logo provenance was last checked. Required for every site record. |
| `categoryMapping` | object | yes | Mapping from platform subservice to site category links |

## `logo-inventory.json`

Top-level shape:

```json
{
  "generatedAt": "2026-04-19T12:00:00.000Z",
  "items": []
}
```

### Logo inventory item fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `name` | string | yes | Display name as currently used in the site data |
| `category` | `agents \| orchestration \| governance \| assistants \| platforms` | yes | Audit grouping only |
| `vendor` | string | no | Parent company or maintainer |
| `logoUrl` | string | no | Relative asset path under `/public/logos/` |
| `status` | `classified \| unclassified` | yes | Whether provenance was reviewed yet |
| `logoKind` | `official-product \| official-vendor \| service-icon \| project-logo \| fallback` | no | Mirrors the site data meaning |
| `sourceUrl` | string \| null | yes | Primary source used during audit; `null` when the item is intentionally still a fallback |
| `notes` | string | no | Audit note, ambiguity, or fallback rationale |
| `reviewedAt` | string | no | ISO date when provenance was last checked |

Rules:
- `logo-inventory.json` is the audit worksheet; `tools.json` and `platforms.json` are the render sources.
- Keep the field naming differences explicit: inventory uses `sourceUrl` / `notes` / `reviewedAt`, while site data uses `logoSourceUrl` / `logoNotes` / `logoReviewedAt`.
- If `status` is `classified`, populate `logoKind` and `reviewedAt`.
- `logoKind: fallback` means the current checked-in asset is intentionally treated as a reviewed fallback, not that an official mark can never exist.
- `logoKind: service-icon` means the rendered asset comes from a vendor service/icon library and should be presented distinctly from a product/project logo in UI treatment.

## `updates.json`

Top-level shape, with illustrative dates:

```json
{
  "lastUpdated": "2026-04-11",
  "updates": []
}
```

### Updates envelope fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `lastUpdated` | string | yes | ISO date (`YYYY-MM-DD`) when the updates feed was last regenerated or source-audited |
| `updates` | object[] | yes | Curated update entries, ordered newest first |

Entries must be ordered newest first.

### Update object fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | string | yes | Unique id like `update-2026-04-11-01` |
| `date` | string | yes | ISO date |
| `toolId` | string | yes | Foreign key to `tools.json` or a stable platform id |
| `toolName` | string | yes | Denormalized display name |
| `category` | `platforms \| agents \| orchestration \| governance \| assistants` | yes | Category bucket |
| `type` | `release \| acquisition \| deprecation \| rename \| funding \| feature \| model-addition` | yes | Update type |
| `title` | string | no | Short feed headline for cards and previews |
| `summary` | string | yes | Max 280 chars target |
| `sourceUrl` | string | yes | Required for every entry, no exceptions |
| `sourceTitle` | string | no | Human-readable source title |
| `impact` | `high \| medium \| low` | no | Optional impact flag |

## `data/snapshots/<YYYY-MM-DD>.json`

Derived/computed artifact, not primary data. Written by
`scripts/snapshot-current.mjs` (`npm run snapshot-weekly`) on each `/radar`
weekly run — additive across dates in normal operation; passing an explicit
date argument to the script overwrites that date's file. Powers the M4
"what changed" view as the persistent record of how the dataset moves week to
week.

Top-level shape:

```json
{
  "snapshotDate": "YYYY-MM-DD",
  "toolsLastUpdated": "YYYY-MM-DD | null",
  "tools": [],
  "platforms": []
}
```

### Snapshot envelope fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `snapshotDate` | string | yes | ISO date (`YYYY-MM-DD`) the snapshot represents — the file name matches. |
| `toolsLastUpdated` | string \| null | yes | Mirror of `data/tools.json.lastUpdated` at snapshot time. |
| `tools` | object[] | yes | One digest per tool, sorted by `id`. See "Snapshot tool digest" below. |
| `platforms` | object[] | yes | One digest per platform, sorted by `id`. See "Snapshot platform digest" below. |

`platforms.json` does not currently carry a top-level `lastUpdated` field, so
the envelope intentionally has no `platformsLastUpdated`. Each platform digest
captures its own per-record `lastUpdated`.

### Snapshot tool digest fields (`snapshot.tools[]`)

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | string | yes | Mirror of `tool.id`. |
| `name` | string | yes | Mirror of `tool.name`. |
| `category` | string | yes | Mirror of `tool.category`. |
| `license` | string \| null | yes | Mirror of `tool.license`. |
| `version` | string \| null | yes | Mirror of `tool.version`. |
| `lastRelease` | string \| null | yes | Mirror of `tool.lastRelease`. |
| `status` | string \| null | yes | Mirror of `tool.status`. |
| `githubStars` | number \| null | yes | Mirror of `tool.githubStars`. |
| `governance` | object | yes | Per-dimension digest (status only, plus `models`, `role`, `level`, `reviewedAt`). `deployment.models` array is sorted. |

### Snapshot platform digest fields (`snapshot.platforms[]`)

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | string | yes | Mirror of `platform.id`. |
| `name` | string | yes | Mirror of `platform.name`. |
| `formerNames` | string[] | yes | Mirror of `platform.formerNames`. |
| `modelCount` | string \| null | yes | Mirror of `platform.modelCount`. |
| `onPremises` | string \| null | yes | Mirror of `platform.onPremises`. |
| `regions` | string \| null | yes | Mirror of `platform.regions`. |
| `compliance` | string[] | yes | Mirror of `platform.compliance`, sorted. |
| `lastUpdated` | string \| null | yes | Mirror of `platform.lastUpdated`. |

## `data/snapshot-diffs.json`

Derived artifact. Written by `scripts/diff-snapshots.mjs` (`npm run diff-snapshots`)
during each `/radar` weekly run. Reads every `data/snapshots/*.json` file in
chronological order and emits one event per changed field per adjacent
snapshot pair. Powers the M7 "auto-detected changes" view on `/updates` and the
per-tool change history.

Top-level shape:

```json
{
  "generatedAt": "YYYY-MM-DD",
  "snapshotCount": 1,
  "events": []
}
```

### Snapshot diff envelope fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `generatedAt` | string | yes | ISO date (`YYYY-MM-DD`) the diff artifact was generated. |
| `snapshotCount` | number | yes | Number of snapshot files considered. Events render only when `snapshotCount >= 2`. |
| `events` | object[] | yes | All diff events across every adjacent snapshot pair, newest first. |

### Snapshot diff event fields (`events[]`)

| Field | Type | Required | Notes |
|---|---|---:|---|
| `toolId` | string | yes | Tracked tool `id`. |
| `toolName` | string | yes | Tracked tool `name` at the time of the newer snapshot. |
| `from` | string | yes | ISO date of the older snapshot in the pair. |
| `to` | string | yes | ISO date of the newer snapshot in the pair. |
| `field` | string | yes | Field path, e.g. `license`, `governance.soc2`, `governance.licenseRisk.level`, or `tracked` for add/remove. |
| `previous` | unknown | yes | Field value in the older snapshot (or `null`). |
| `current` | unknown | yes | Field value in the newer snapshot (or `null`). |
| `highImpact` | boolean | yes | `true` for license, status, certifications (SOC 2 / ISO 27001 / ISO 42001), license-risk level, and tool removals — surfaces a warning badge in the UI. |

## `data/comparison-slugs.json`

Curated list of tool-vs-tool pairings rendered as static `/tools/compare/<slug>/`
routes. Maintained by hand; each entry produces one SSG page and one sitemap URL.
Consumed by `lib/comparisons.ts` (page rendering) and
`scripts/generate-seo-artifacts.mjs` (sitemap).

Top-level shape: a JSON array of `ComparisonPair` objects (no envelope).

| Field | Type | Required | Notes |
|---|---|---:|---|
| `slug` | string | yes | URL-safe kebab-case slug, unique across all entries. Drives `/tools/compare/<slug>/`. |
| `toolIds` | string[] | yes | 2–3 `id` values from `tools.json`. All must resolve at build time or the route renders `notFound()`. |
| `title` | string | yes | Page `<h1>` and SEO title. |
| `description` | string | yes | Page meta description and JSON-LD `description`. |

## `eu-ai-act.json`

EU AI Act application-date timeline rendered in the site-wide `EuAiActBanner`
(next-milestone countdown). Consumed and typed by `lib/eu-ai-act.ts`
(`EuAiActMilestone`) and covered by `lib/eu-ai-act.test.ts`.

Top-level shape: a JSON array of milestone objects (no envelope). `appliesOn`
values are the dates **legally in force under the adopted AI Act**; a tranche
whose application is the subject of a proposed-but-not-yet-published amendment
(e.g. the Digital Omnibus on AI) keeps its in-force date and notes the proposed
deferral in `summary` until the amendment is published in the Official Journal.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `label` | string | yes | Short milestone name shown in the banner. |
| `appliesOn` | string | yes | ISO `YYYY-MM-DD` legally-in-force application date. |
| `summary` | string | yes | One- to two-sentence status, including any provisional deferral and its proposed new date. |
| `sourceUrl` | string | yes | `https://` primary source backing the entry's claim (official Commission timeline for in-force dates; the relevant legislative-status page for a proposed deferral). |

## `eu-ai-act-obligations.json`

EU AI Act obligation knowledge layer rendered on `/eu-ai-act` and, per risk
tier, on each per-tool page. Consumed, validated, and typed by
`lib/eu-ai-act-obligations.ts` (`parseObligationsDataset` throws on any shape
violation at module load, so a malformed dataset fails the build) and covered
by `lib/eu-ai-act-obligations.test.ts`. Source of truth for feed artifacts:
`public/eu-ai-act-deadlines.ics` is generated from the timeline in
`eu-ai-act.json`; the obligations file feeds page content only.

Top-level shape:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `asOf` | string | yes | ISO `YYYY-MM-DD` date the legal-status summary was last verified. The weekly Radar refreshes this whenever the omnibus/legislative status moves — and reviews it at minimum monthly. |
| `statusSummary` | string | yes | Plain-language "where the law stands" paragraph. States adopted-law dates as law and any pending amendment as provisional. |
| `statusSourceUrl` | string | yes | `https://` legislative-status source for the summary. |
| `obligations` | array | yes | Obligation objects, unique `id` each. |

### Obligation object fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | string | yes | Stable lowercase-kebab id. |
| `articles` | string | yes | Human-readable article reference, e.g. `Articles 8–17`. |
| `title` | string | yes | Short obligation name. |
| `actors` | string[] | yes | Any of `provider \| deployer \| gpai-provider`. |
| `riskTiers` | string[] | yes | Any of `prohibited \| high-risk \| limited-risk \| minimal-risk \| all`. `all` = every concrete tier. Tool pages map `governance.euAiAct.role` onto this; `gpai-provider`-only obligations never map from a tool risk tier. |
| `kind` | string | yes | `mandatory \| voluntary`. |
| `appliesFrom` | string | yes | ISO `YYYY-MM-DD` legally-in-force application date under the adopted Act. |
| `deferral` | object | no | Pending amendment only: `proposedDate` (ISO date, must be later than `appliesFrom`), `status` (plain language, names the instrument and that it is not yet in the Official Journal), `sourceUrl` (`https://` legislative-status page). Remove the field once the amendment is published and fold the new date into `appliesFrom`. |
| `summary` | string | yes | One- to two-sentence plain-language description of the duty. |
| `sourceUrl` | string | yes | `https://` official text (EUR-Lex for article-mapped duties; Commission policy page acceptable for GPAI context). |

## Data freshness

`tool.governance.reviewedAt` records when each per-tool governance posture was
last verified end-to-end. Two consumers depend on it:

- The per-tool page renders a **Verified `<date>`** chip when the reviewed date
  is within the threshold and switches the chip to **Stale `<date>`** styling
  when it is older. Logic lives in `lib/freshness.ts`.
- `scripts/check-data-freshness.mjs` (`npm run check-data-freshness`) prints
  every tool past the threshold so the next `/radar` run can re-verify them
  first. It runs as an informational gate during `/radar` prep — it does not
  block the build.

The current threshold is **60 days**. Update it in one place
(`FRESHNESS_THRESHOLD_DAYS` in `lib/freshness.ts` and the mirrored constant in
`scripts/check-data-freshness.mjs`) and reflect the change here in the same PR.

## Rules

- Do not add undeclared fields without updating this schema document and the build guide decision.
- Every weekly update entry must include `sourceUrl`.
- License values must be exact; if uncertain, omit or verify before commit.
- The site must render from these JSON files only for v1.
- Naming rules from the build guide are strict: use `Microsoft Foundry`, `Gemini Enterprise`, and `Amazon Q Developer` exactly.
