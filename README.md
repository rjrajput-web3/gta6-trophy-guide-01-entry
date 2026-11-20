# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Platinum Trail — the complete GTA VI trophy guide and tracker: all 55 trophies (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), a three-phase platinum roadmap, the one missable trophy flagged, and an offline tracker that saves your progress in the browser.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080/app/index.html — no build step, no network calls, everything runs locally.

## What it does

- **All 55 trophies**, live-researched and cross-checked across the published lists (GamesRadar+, PowerPyx, GameMapa). Grades, Gamerscore, categories, and unlock conditions for every trophy.
- **Tracker**: tick trophies off, watch the progress bar, filter by grade or category, search by name or condition, export/import your progress as JSON. Progress lives only in localStorage — nothing leaves your machine.
- **Spoiler-safe by default**: the 28 hidden trophies (story + secret ones) stay hidden until you turn the spoiler filter off.
- **The one missable trophy**: Positive Mental Attitude. The Chapter 1 balcony meditation with Lucia cannot be repeated after Chapter 1 — the guide says so up front.
- **Honest about the unknown**: five hidden trophies have unconfirmed triggers. The guide says so plainly and invents nothing.

## The platinum at a glance

| Item | Value |
| --- | --- |
| Total trophies | 55: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze |
| Online trophies | 0 |
| Difficulty (PowerPyx) | 4/10 |
| Time to platinum | about 200 hours |
| Minimum playthroughs | 1 |
| Hardest trophy | A Long Road (100% completion) |
| Missable | Positive Mental Attitude only |

Roadmap: Phase 1 story & side missions (60–80h), Phase 2 the 100% checklist & Challenges (~100h), Phase 3 Strangers & Freaks and cleanup (~10h). There is no mission replay and no New Game+, so keep a save at the start and end of every chapter. Cheats disable trophies and saving.

## Files

- `app/index.html` — the guide and tracker page
- `app/app.js` — rendering, filters, search, localStorage progress, export/import
- `app/style.css` — the whole look
- `app/data/trophies.json` — the 55-trophy dataset
- `main.ts` — builds `dossier.json` from the counted files (deterministic)
- `shots.json` — the four screenshot scenes
- `serve.ts` — the local dev server

---

<sub>Entered on [make.fun](https://make.fun/?ref=9hqpawrx&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
