# Platinum Trail — GTA VI Trophy Guide & Tracker

An offline web app that is the best guide and tracker for the 55 PlayStation 5
trophies of **Grand Theft Auto VI**: every trophy with its official name,
description and grade, a checklist saved in the browser, export and import,
filters by grade and category, a spoiler setting that hides story trophies
until they are earned, a three-phase roadmap to the Platinum, and the missable
trophies flagged — each trophy with a guide in our own words that cites its
sources.

## The list at a glance

- **55 trophies:** 1 Platinum, 2 Gold, 6 Silver, 46 Bronze
- **Platinum:** *Vice Got a Price!* — unlock every other trophy
- **28 hidden** on PlayStation until earned; **0 online** trophies
- **Difficulty 4/10, about 200 hours**, one playthrough is enough
- **One possibly-missable trophy:** *Positive Mental Attitude* — meditate with
  Lucia on the balcony at Jason's house in Chapter 1, or it may be gone for
  good. Everything else is still earnable in free roam after the ending.

## Roadmap

1. **Story & side missions (60–80 h).** Play the story, take optional missions
   as they appear, scan vehicles with WAiNK and study animals with binoculars.
2. **The 100% checklist & Challenges (~100 h).** After the ending, the
   checklist under Progress > Stats is the spine of the run: every robbery,
   underwater discovery, shooting range, drone race and Bret quest, plus 70 of
   the 80 Challenges and 15 of the 18 card sets.
3. **Strangers & Freaks and cleanup (~10 h).** The five side-character finals
   and any stray open-world trophies.

No mission replay exists — keep a separate manual save at the start and end of
every chapter. Cheats disable trophies and saving.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

Or open `app/index.html` from any static server. The app works with the
network off: it loads only its own files.

## Build the dossier

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and
writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

## Screenshots

Four real renders of the guide's own code, taken in headless Chromium at
1280×800 (see `shots.json` for the shot plan):

1. `01-cover.jpg` — hero, progress bar, checklist
2. `02-roadmap.jpg` — the three-phase roadmap to the Platinum
3. `03-missable.jpg` — the missable filter: Positive Mental Attitude alone
4. `04-detail.jpg` — a trophy guide open with its sources

## Sources

Trophy names, descriptions and grades are the official PlayStation 5 list as
reported by Push Square and cross-checked with GameMapa (GamesRadar+ /
PowerPyx) and PSNProfiles / TrueTrophies counts:

- Push Square — GTA 6: Trophy Guide & Roadmap
- GameMapa — All 55 GTA 6 Trophies: Full List, Gamerscore and Platinum Roadmap
- PowerPyx — GTA 6 Trophy Guide & Roadmap (via GameMapa)
- GamesRadar+ — GTA 6 Trophy and Achievement list (via GameMapa)
- PSNProfiles / TrueTrophies — trophy counts and hidden flags (via sixshore)

Guide text is written in our own words from those sources; every trophy card
names the sources it draws on. Five hidden trophies (*In the Beginning…*,
*Capital Offense*, *Bad Luck, I Guess*, *The Truth Is Out There*, *Ten Pin*)
still have unconfirmed triggers — the guide says so plainly instead of
inventing one.

## License

MIT — see `LICENSE`. Unofficial fan guide; no Rockstar logo or official
artwork is used anywhere in the app or its screenshots.
