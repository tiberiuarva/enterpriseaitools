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
| `clouds` | string[] | no | Any of `azure`, `aws`, `gcp` |
| `license` | string | yes | Exact license label |
| `licenseWarning` | string | no | Caveat for source-available, proprietary core, branding, etc. |
| `githubUrl` | string | no | Official repository URL |
| `githubStars` | number | no | Open source star count only when verified |
| `version` | string | no | Current stable version |
| `lastRelease` | string | no | ISO date |
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

Top-level shape:

```json
{
  "updates": []
}
```

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
| `summary` | string | yes | Max 280 chars target |
| `sourceUrl` | string | yes | Required for every entry, no exceptions |
| `sourceTitle` | string | no | Human-readable source title |
| `impact` | `high \| medium \| low` | no | Optional impact flag |

## Rules

- Do not add undeclared fields without updating this schema document and the build guide decision.
- Every weekly update entry must include `sourceUrl`.
- License values must be exact; if uncertain, omit or verify before commit.
- The site must render from these JSON files only for v1.
- Naming rules from the build guide are strict: use `Microsoft Foundry`, `Gemini Enterprise`, and `Amazon Q Developer` exactly.
