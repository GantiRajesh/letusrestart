# Update Guide — making changes safely

Golden rule: **content changes are data edits; only new capabilities are code edits.** Most updates you'll ever make are in `src/regions/*.json` or `src/config/*.js`.

## Everyday changes

| I want to… | Edit | Code change? |
|---|---|---|
| Rename or re-theme the site | `src/config/brand.js` | No |
| Update a legal figure (cap, band, threshold) | The region's JSON → `rules`, **and** bump `governance.lastChecked` + append to `changeLog` | No |
| Add/edit a glossary term, checklist item, or support service | Region JSON → `glossary` / `checklist` / `directory` | No |
| Turn on ads / affiliates / partner placements | `src/config/monetisation.js` | No |
| Change triage questions or results | `src/data/triage.js` | Light |
| Add a whole new country | See below | One import line |
| Add a new feature (e.g. budgeting tool) | New file in `src/pages/` + route in `App.jsx` + nav item in `Layout.jsx` | Yes |

## Updating a legal figure (the change that matters most)

Example: the UK weekly cap changes next April.

1. Open `src/regions/uk.json`
2. Change `rules.weeklyPayCap`
3. Update `governance.lastChecked` to today
4. Append to `governance.changeLog`:
   ```json
   { "date": "2027-04-06", "change": "Weekly pay cap raised from 751 to XXX per Increase of Limits Order 2027." }
   ```
5. `npm run build`, test the calculator against the official GOV.UK calculator with 2–3 cases, deploy.

Set a **quarterly recheck** per region (calendar reminder): visit `governance.sourceUrl`, confirm figures, bump `lastChecked` even when nothing changed — the date is shown to users as a trust signal.

## Adding a new region

1. Copy `src/regions/au.json` → `src/regions/ca.json` (pick the structurally closest existing region).
2. Replace every value: identity, terminology, `rules`, checklist, glossary, directory. Delete nothing from the schema — components expect all keys.
3. Choose the calculation model:
   - Weeks-of-pay lookup by service band → `"redundancyModel": "service-bands"`
   - Per-year multiplier by age → `"redundancyModel": "age-multiplier"`
   - Neither fits → add a new model branch in `src/lib/entitlements.js` (keep the same output shape)
4. Register it in `src/regions/index.js`:
   ```js
   import ca from './ca.json';
   export const regions = { au, uk, ca };
   ```
5. Extend `detectRegion()` with the locale/timezone hints for the new country.
6. **Before shipping:** have a local employment lawyer or HR body review the ruleset and put their name in `governance.reviewer`. Never launch a region with `"UNREVIEWED"`.

## Adding a new feature page

1. Create `src/pages/MyFeature.jsx` — self-contained, reading shared state only via `useRegion()` and `lib/storage`.
2. Add a route in `src/App.jsx` and (optionally) a nav item in `src/components/Layout.jsx`.
3. If the feature shows region-specific content, put that content in the region JSON files, not in the component.
4. If the feature could ever carry ads, decide now: add its route to `AD_PROTECTED_ROUTES` or `AD_ALLOWED_ROUTES` in `src/config/monetisation.js`. Unlisted routes never show ads (safe default).

## Workflow & versioning

- Work on a branch, open a PR; Vercel/Netlify give you a preview URL per PR to click through before merging.
- Never edit `dist/` — it's generated. Never commit `node_modules/`.
- Tag releases that change legal figures (`git tag rules-uk-2027-04`), so you can always answer "what did the site say on date X?" — useful if a user ever disputes a number.

## Testing before every deploy

```bash
npm run build && npm run preview
```
- Click through all 8 routes in both regions.
- Calculator spot-checks: AU — 4 yrs / age 40 / $1,500 → 3 wks notice, 8 wks redundancy. AU small business → no redundancy pay. UK — 10 yrs / age 45 / £800 → cap message, 12.5 wks × £751. UK 1.5 yrs → doesn't qualify.
- Triage → result → checklist personalisation (a "suspicious" path adds the deadline items).
