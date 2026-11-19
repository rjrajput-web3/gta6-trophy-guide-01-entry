# Vice City Trophy Atlas

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/rjrajput-web3/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

The complete offline guide and tracker for all **55 PlayStation 5 trophies** of
Grand Theft Auto VI — entered in the
[make.fun GTA 6 trophy guide competition](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **Every official trophy**: all 55 names, descriptions and grades exactly as
  PlayStation publishes them — 1 platinum, 2 gold, 6 silver, 46 bronze.
- **A guide to each trophy in our own words**, with steps and named sources.
  Every guide cites where its facts come from (the official list on Exophase
  and PSNProfiles, plus named community guides); a specific step with no
  source earns no credit here.
- **A tracker**: tick trophies off, progress saves in the browser
  (localStorage), with export to a file, import back, and reset. Progress bar
  and trophy points (1,230 in total) show how close the platinum is.
- **Filters and search**: by kind (story, missable, collectibles, activities,
  online — the official list holds no online trophies), by grade, and by
  earned state; sort by list order, name, grade or unearned-first.
- **Spoiler-safe mode**: hides the names and descriptions of story trophies
  you have not earned yet.
- **Platinum roadmap**: five stages in order, built from the official
  descriptions — story first, missables before the finale, strangers and
  activities, the collectible sweep, then the long grinds.
- **Missable view**: the 10 trophies that need the right moment or set-up,
  flagged and explained.

## How to run it

The guide is plain static files under `app/` with no build step. Serve `app/`
with any static server and open `index.html`:

```sh
node serve.ts
# then open http://localhost:8080
```

It works with the network off: every file it loads sits under `app/`, and it
makes no network request at run time.

## Sources

- Exophase — GTA VI trophy list (official names, descriptions, grades):
  <https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/>
- PSNProfiles — GTA VI trophies (grades and PSN progress counts):
  <https://psnprofiles.com/trophies/43531-grand-theft-auto-vi>
- PowerPyx — GTA 6 Trophy Guide; PlayStationTrophies.org — GTA VI Trophy Guide.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide itself.
- `app/data/trophies.json` — the 55 trophies with guides, steps and sources.
- `screenshots/` — renders of the guide taken in a headless browser.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the vendored make.fun
  library.
- `shots.json` — the manifest of the screenshots in `screenshots/`.

## Licence

MIT — see `LICENSE`. This is an unofficial fan guide, not affiliated with
Rockstar Games. Trophy names and descriptions are shown as PlayStation
publishes them, and no Rockstar logo or official artwork is used.
