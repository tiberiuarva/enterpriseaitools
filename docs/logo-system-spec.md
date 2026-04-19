# Logo system spec

_Last updated: 2026-04-19_

## Goal

Make tool/platform imagery consistent, auditable, and low-risk.

The current problem is not just missing files. It is mixed asset provenance and mixed visual semantics:
- some marks are official product/service icons
- some are OSS project logos
- some are vendor-family/service icons rather than product marks
- some are temporary placeholders/fallbacks

This spec defines the rules before any mass replacement pass.

## Decisions

### 1) Source hierarchy

Use imagery from these sources only, in this order:

1. official product logo or official product/service icon from the owner
2. official vendor icon library / architecture icon pack
3. official OSS project/repo branding asset
4. controlled project fallback

Do not use:
- random third-party logo CDNs
- scraped SVGs without provenance
- guessed redraws
- unofficial icon sets unless explicitly documented as temporary and reviewed

### 2) Allowed logo kinds

Use the following normalized kinds:
- `official-product`
- `official-vendor`
- `service-icon`
- `project-logo`
- `fallback`

These describe what the asset actually is, not whether it looks good.

### 3) Data model

Keep `logoUrl`, but extend records with optional audit metadata:
- `logoKind`
- `logoSourceUrl`
- `logoNotes`
- `logoReviewedAt`

Purpose:
- make provenance explicit
- distinguish official marks from fallbacks
- support later cleanup without re-auditing from scratch

### 4) Fallback strategy

If a defensible official asset is not available, use a deliberate fallback.

Fallback rules:
- prefer text-first treatment over fake pseudo-logos
- fallback must be visually consistent across all tools
- fallback must read as intentional, not as a broken image
- fallback should not mimic a brand mark that does not exist

Default fallback for this project:
- neutral badge container
- first-letter monogram only when no reviewed asset exists
- explicit metadata `logoKind: fallback`

### 5) Asset standards

Preferred file format:
- SVG first
- PNG only when no usable SVG exists from an official source

Rendering standards:
- all marks render inside the same bounded container
- preserve aspect ratio
- avoid over-tight crops
- allow consistent internal padding
- do not force monochrome conversion unless the source asset requires it
- architecture/service icons are acceptable only when recorded as `service-icon`, not misrepresented as product logos

### 6) UI rules

Short-term:
- keep one normalized container treatment for tool/platform imagery
- style fallbacks so they are visibly intentional
- do not silently mix differently styled placeholder badges with official marks as if they are equivalent

Medium-term:
- reduce logo prominence on tool cards if the asset audit shows too many fallbacks/questionable marks
- prefer text clarity over decorative imagery

### 7) Audit workflow

For each tool/platform asset, record:
- `logoUrl`
- `logoKind`
- `logoSourceUrl`
- `logoReviewedAt`
- `logoNotes` when there is ambiguity

Classification workflow:
1. identify current asset file
2. find primary source or confirm none exists yet
3. classify the asset kind accurately
4. document ambiguity instead of guessing
5. only then replace or approve for production use

### 8) Execution order

1. finish inventory classification
2. mark questionable assets explicitly
3. normalize rendering/fallback treatment
4. replace weakest assets first
5. run dark/light/mobile visual QA

## Immediate next actions

- keep `data/logo-inventory.json` as the working audit file
- extend schema/types for logo provenance metadata
- classify existing assets conservatively rather than optimistically
- only start broad UI/logo replacement after the inventory is real

## Non-goals

Not doing in this pass:
- mass vendor-logo scraping
- claiming trademark/reuse rights beyond documented source provenance
- inventing product marks for tools that do not publish one
