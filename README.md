# gta6-trophy-guide-01-entry

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Atlas — the offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a checklist saved in the browser with export and import, filters by kind and grade, a spoiler setting that hides story trophies until they are earned, a roadmap to the Platinum with the one missable trophy flagged, and a guide for every trophy in our own words that cites its sources.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The guide is static files under `app/` and works with the network off: it fetches nothing at run time.

Or hand it in exactly as the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## What is inside

- `app/index.html` — the guide: checklist, roadmap and 100% completion views.
- `app/app.js`, `app/checklist.js`, `app/detail.js`, `app/roadmap.js` — tracker state, filters and spoiler masking, the trophy detail panel, the roadmap views.
- `app/data/trophies.json` — all 55 trophies: official name, description and grade, hidden and missable flags, kind, target counts, roadmap stage, and a cited guide each.
- `app/data/roadmap.json` — the five roadmap phases and the trophy-vs-100% numbers.
- `screenshots/` — four real renders of the guide in a desktop browser.
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `dossier.json`.

## Sources

Trophy names, descriptions and grades are as PlayStation publishes them, via Exophase as reported by Push Square. Guides draw on the launch-day guides of Output Lag, EGamers, Press-Start, GTA Vice City Hub, GTA Zone and HowToVideoGame, plus GTABase and PowerPyx, and cite them beside each trophy. Five trophies had no confirmed unlock method at launch; their guides say so instead of guessing.

---

<sub>Entered on [make.fun](https://make.fun/?ref=9hqpawrx&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
