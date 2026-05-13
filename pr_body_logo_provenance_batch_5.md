## Summary
- replace fallback badges for LLM Guard, Arthur GenAI Engine, and Paperclip with owner-controlled official assets
- update tool metadata, logo inventory provenance, and the checked-in logo provenance README
- regenerate the logo audit report after the new sourced assets land

## Source provenance
- LLM Guard -> `https://protectai.github.io/llm-guard/` (`assets/logo.png`)
- Arthur GenAI Engine -> `https://cdn.prod.website-files.com/6230fe4706acf355d38b2d54/65f1f0729cccedd4ee58a22f_4432740f72d95f5501ea19277805d621_arthur-logo-dark.avif` (owner-controlled Webflow CDN homepage asset)
- Paperclip -> `https://paperclip.ing/favicon.svg` (verbatim favicon bytes from the owner-controlled homepage, rendered as a square service icon)

## Validation
- `npm run check-logo-provenance`
- `npm run report-logo-audit`
- `npm run check-logo-audit-report`
- `npm run lint` *(existing warning only: `components/platform-mark.tsx` uses raw `<img>`)*
- `npm run build`
