# Architecture

## Principles

The whole design follows five rules, each traceable to the product brief:

1. **Jurisdiction is data, not code.** Every legal rule, glossary term, checklist item, and support service lives in a per-country JSON file with a shared schema. The calculator, triage, checklist, glossary, and directory are generic components that render whatever the active region file contains. Adding a country never means touching component code.
2. **Every element is independent.** Pages never import each other. Each feature owns its own route, its own storage keys, and reads shared state only through two narrow interfaces: `RegionContext` (which country) and `lib/storage` (on-device persistence). Any feature can be rewritten, removed, or extracted to a microservice later without touching the others.
3. **Config over code for everything a non-developer might change.** Brand (name, colours, radius) → `src/config/brand.js`. Revenue → `src/config/monetisation.js`. Both are applied at runtime, so re-theming or flipping a revenue stream is a one-file edit.
4. **Non-negotiables are enforced in code.** The "no ads on vulnerable pages" rule isn't a comment — `AdSlot` checks the route against `AD_PROTECTED_ROUTES` and returns null. Free directory entries sort above paid ones in `Directory.jsx` unconditionally.
5. **Client-only until it can't be.** The MVP has no backend at all: nothing to breach, nothing to maintain, free to host, fast everywhere. The seams where a backend will later attach are explicit (below).

## Data flow

```
region JSON (au.json, uk.json)
        │
regions/index.js  (registry + locale/timezone auto-detect)
        │
RegionContext  (active region + user override, persisted)
        │
┌───────┼──────────┬───────────┬───────────┬────────────┐
Calculator      Checklist    Glossary    Directory    Footer/Disclaimer
(entitlements    (filtered    (search)    (filter +    (source + lastChecked
 engine reads     by triage               free-first)   surfaced to user)
 rules)           tags)
```

`lib/entitlements.js` is the only "smart" shared logic: a generic engine supporting two calculation models (`service-bands` for AU-style regimes, `age-multiplier` for UK-style). A new common-law country (Canada, NZ, Ireland) will almost certainly fit one of these two models → data-only addition. A structurally different regime (US at-will, EU civil-law) gets a new model branch behind the same interface — the UI never changes.

## Region file schema

Each `src/regions/<id>.json` contains:

| Key | Purpose |
|---|---|
| `id, name, flag, currency, currencySymbol, dateFormat` | Localisation |
| `terminology` | Word choices injected into shared copy ("redundancy" vs "layoff", benefit names) |
| `governance` | `source`, `sourceUrl`, `lastChecked`, `reviewer`, `changeLog[]` — surfaced in the UI footer and disclaimers |
| `rules` | Notice bands, redundancy model + bands/multipliers, caps, exemptions, qualifying service |
| `checklist[]` | Phased items with `tags` for triage personalisation |
| `glossary[]` | term/definition pairs |
| `directory[]` | Support services with `free` and `partner` flags |

## State & persistence

All user state is on-device via `lib/storage.js` (namespaced localStorage): region override, triage result + tags, calculator-used flag, checklist progress. `clearAll()` powers the one-click erase button on `/about`. When accounts arrive, `storage.js` is the single seam to swap for an API-backed store — feature code doesn't change.

## Expansion seams (to-be state)

| Future feature | Where it attaches |
|---|---|
| Accounts & saved progress | Replace `lib/storage.js` internals with API sync; add auth provider around `App` |
| Document vault | New route + backend service; never store documents client-side beyond upload |
| AI companion | New route; grounded retrieval over the same region JSON content (the content model is already structured for it) |
| Timeline & reminders | Derive dates from calculator/triage inputs already captured; add notification service |
| Career tools / community / marketplace / B2B sibling | Each is a new route bundle + its own backend; the region registry, brand config, and monetisation flags are already shared infrastructure |
| Multi-language | Wrap copy in an i18n layer; region files already separate *jurisdiction* from *language*, which is the hard part |

## Tech choices

- **React 18 + Vite** — mainstream, fast builds, easy hiring, no lock-in.
- **react-router-dom** — client routing; hosts get SPA rewrites via `vercel.json` / `_redirects`.
- **No CSS framework** — one `global.css` driven by CSS variables from `brand.js`. Nothing to fight when customising; trivially replaceable with Tailwind later if the team prefers.
- **No state library** — context + localStorage is sufficient at this scale; introduce one only when accounts land.
- **Zero third-party runtime services** — no fonts CDN, no analytics, no trackers. Privacy is a feature.
