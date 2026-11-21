# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Platinum Trail** — the complete GTA VI trophy guide, roadmap and tracker. All 55 trophies (1 Platinum, 2 Gold, 6 Silver, 46 Bronze) with names, descriptions and grades as PlayStation publishes them, a cited step-by-step walkthrough for every trophy, a difficulty rating and a time estimate on every card, and an offline tracker that saves progress in the browser.

Bounty: https://make.fun/bounty/gta6-trophy-guide-01

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080/ — no build step, no network calls, everything runs locally and offline.

## What it does

- **All 55 trophies, fully guided.** Every trophy carries its official name, description and grade, its unlock condition, and an original walkthrough in three parts — overview, numbered steps, and a practical tip. Each guide names its source beside it (the official PlayStation list, PowerPyx, GamesRadar+).
- **A four-stage platinum roadmap.** Stage 1 the story spine, Stage 2 the missable and chapter-locked trophies first, Stage 3 the open world, Stage 4 endgame cleanup and the 100% checklist. Every trophy sits in exactly one stage, in the order it should be earned.
- **The one missable trophy, flagged everywhere.** Positive Mental Attitude: the Chapter 1 balcony meditation with Lucia cannot be repeated after Chapter 1. It is bannered at the top of the page, badged on its card, and placed first in Stage 2.
- **Honest about the unknown.** Six trophies (Fair Game, In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin) still have unconfirmed triggers in the published lists. They are flagged as unconfirmed and their guides state plainly what is known — no trigger is invented.
- **Difficulty and time on everything.** Every card and detail panel shows a 1–5 difficulty rating and a time estimate, honestly framed as community estimates. A difficulty filter lets you plan an easy-first session.
- **A real tracker.** Progress ring and completion stats in the header (earned count, Gamerscore earned, trophies left, missable status), earned toggles shared between the guide and the roadmap, search across names, descriptions and guides, filters by grade, category and difficulty, a spoiler setting that hides the 28 hidden trophies until earned, and export/import of progress as JSON. Progress lives only in localStorage.

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
| Unconfirmed triggers | 6, flagged in the guide |

## Files

- `app/index.html` — the guide, roadmap and tracker page
- `app/app.js` — rendering, roadmap stages, filters, search, detail walkthroughs, localStorage progress, export/import
- `app/style.css` — the whole look
- `app/data/trophies.json` — the 55-trophy dataset (official names/descriptions/grades, guides, difficulty, time, roadmap stage)
- `app/icon.svg` — the page icon
- `main.ts` — builds `dossier.json` from `app/` and `screenshots/` with the vendored library
- `shots.json` — the four screenshot scenes
- `serve.ts` — the local dev server

---

<sub>Entered on [make.fun](https://make.fun/?ref=9hqpawrx&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
