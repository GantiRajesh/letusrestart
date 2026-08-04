# Rebound — from job loss to what's next

A calm, plain-English, interactive companion for anyone who has lost a job — through redundancy, layoff, contract end, or forced resignation. It guides people from the moment of shock through to re-employment: what's happening, what they're legally owed wherever they are, and what to do next, in the right order.

## Quick start

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

Requires Node.js 18+.

## What's in the MVP

| Feature | Route | Notes |
|---|---|---|
| Interactive journey map | `/` | 6-stage clickable map; stages light up as the user progresses |
| Plan wizard | `/plan` | One guided flow: situation triage, "is this genuine?" sniff test, and the money questions. Ends in a personal plan: verdict, animated entitlement figures, deadline warnings, next moves. Fully data-driven from the region ruleset (AU service-bands, UK age-multiplier). `/triage` and `/calculator` redirect here. |
| Personalised checklist | `/checklist` | Phased (48h / week / month / forward), progress ring, deadline tags, saved on-device |
| Jargon buster | `/glossary` | Searchable accordion, per-region terminology |
| Support directory | `/directory` | Verified free services first, category filters |
| Emotional reset | `/reset` | Breathing exercise, grounded reassurance, crisis contacts |
| Region switching | header | AU/UK pill toggle. Auto-detected from browser locale/timezone, always user-overridable, persisted |

UI: dark, modern theme (violet/teal gradient on deep navy) inspired by the sackedmate.com direction. Fully responsive: desktop nav, tablet grids, mobile burger menu, thumb-sized touch targets.

Regions shipped: **Australia** and **United Kingdom** — each a single JSON file with sourced, dated rules.

## Project structure

```
rebound/
├── index.html
├── package.json / vite.config.js
├── vercel.json / public/_redirects     # SPA routing + security headers for hosts
├── docs/                               # all guides (see below)
└── src/
    ├── main.jsx / App.jsx              # entry + routing + theme injection
    ├── config/
    │   ├── brand.js                    # ← rename/re-theme the entire site here
    │   └── monetisation.js             # ← all revenue streams + feature flags
    ├── regions/
    │   ├── index.js                    # region registry + auto-detection
    │   ├── au.json / uk.json           # per-country rules, glossary, directory, checklist
    ├── data/triage.js                  # shared decision tree
    ├── lib/
    │   ├── entitlements.js             # generic calculation engine (data-driven)
    │   └── storage.js                  # namespaced localStorage wrapper
    ├── context/RegionContext.jsx
    ├── components/                     # Layout, JourneyMap, AdSlot, Disclaimer
    ├── pages/                          # one file per route — fully independent
    └── styles/global.css               # all styling via CSS variables
```

Every element is independent by design: pages don't import each other, features read only from the region context and their own storage keys, and all legal content lives in data files — see `docs/ARCHITECTURE.md`.

## Documentation

- `docs/ARCHITECTURE.md` — how it's built, why, and how it expands to the full to-be state
- `docs/DEPLOYMENT.md` — step-by-step deployment to Vercel / Netlify / Cloudflare / GitHub Pages / any host
- `docs/UPDATING.md` — making changes safely: content, regions, features, legal-figure updates
- `docs/MONETISATION.md` — the revenue framework and how to switch each stream on
- `docs/SECURITY.md` — security posture now and requirements for future phases
- `docs/ROADMAP.md` — the path from this MVP to the full career-transition platform

## Non-negotiables (enforced, not just stated)

1. Core rights info and the calculator are always free — `AdSlot` refuses to render on those routes even if misplaced.
2. Every legal claim carries `source`, `lastChecked`, and `reviewer` fields, surfaced in the UI.
3. Data collection is minimal: no accounts, no analytics on answers, everything on-device, one-click erase.
4. Calm, plain English throughout.

## Status

MVP scaffold — **legal rulesets are authored from official published sources but not yet reviewed by qualified local professionals**. Each region file carries `"reviewer": "UNREVIEWED"` until that happens. Do not launch publicly before review.
