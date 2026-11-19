# gta6-trophy-guide-01-entry

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Platinum Trail — an offline web guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a guide in our own words that cites its sources, a saved checklist with progress and trophy points, search and filters by kind and grade, a spoiler-safe mode, export/import/reset, a seven-stage roadmap to the platinum, and a missable-trophy view with the reason each trophy can be missed. Built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in USDC.

## Audit — checked 19 Nov 2026

- 55 of 55 official names, descriptions and grades match Exophase and PSNProfiles.
- 28 of the 55 are hidden on PlayStation until earned.
- 8 missable trophies flagged, each with the reason it can be missed.
- 20 trophies carry the exact count PlayStation tracks (for example 250 stunts, 42 gold shooting-range medals, 100% completion, $250,000 laundered, $100,000 spent), as PSNProfiles shows them on 19 Nov 2026.
- Every guide cites its sources with the 19 Nov 2026 check date; where an official description does not pin down an exact place or trigger, the guide says so instead of inventing one.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — the guide runs entirely from its own files, with the network off.

To build the submission output (what the judge reads):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## What is inside

- `app/index.html` — the guide: checklist with a featured cited guide, roadmap, missable and sources views, plus hash-routed trophy detail pages.
- `app/app.js` — tracker logic: localStorage checklist, search, kind and grade filters, sorting, spoiler-safe mode, export/import/reset, the seven-stage roadmap and the missable watch list.
- `app/style.css` — the guide's own look: a dark sunset theme, no Rockstar logo or official artwork.
- `app/data/trophies.json` — all 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with official descriptions and grades, a guide in our own words, steps, kind, missable flag and reason, roadmap stage, verified count targets and dated sources for each.
- `screenshots/` — four real renders of the guide in a browser.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.

## Sources

Official trophy names, descriptions and grades are as PlayStation publishes them, as listed by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi), re-checked 19 Nov 2026. Every guide is written for this entry from the official description; where a description does not pin down an exact place or trigger, the guide says so instead of inventing one.

## License

MIT — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
