# Vice City Trophy Atlas — GTA VI Trophy Guide & Tracker

[![GTA 6 trophy guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI, built for the [make.fun GTA 6 trophy guide competition](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **Every trophy** with its official PlayStation name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze).
- **A guide in our own words** for each trophy: what to do, where and how, and when it can be missed — with its sources cited beside it.
- **A roadmap to the platinum** in six stages, in the order to play them.
- **Missable flags** on the 16 trophies tied to a single story moment, so they are done on the first pass.
- **A tracker**: tick trophies off, saved in the browser with localStorage, with search, filters (story, missable, collectibles, activities, online), a spoiler-safe mode that hides story trophies until earned, and progress export/import as JSON.

## Run it

Serve `app/` with any static HTTP server and open `index.html`. No build step, no network requests at run time.

```sh
cd app && python3 -m http.server 8080
```

## How the entry is built

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts` (the kit's copy, unchanged).

## Sources

Trophy names, descriptions and grades are the official PlayStation list, as published by Exophase and PSNProfiles. Activity and mission guidance draws on the IGN GTA 6 wiki and GTA Wiki, cited per trophy. All guide text is written for this entry. This is an unofficial fan guide: no Rockstar Games logo, artwork or game screenshots are used.

## License

MIT — see [LICENSE](LICENSE).
