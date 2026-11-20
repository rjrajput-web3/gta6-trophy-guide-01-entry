# Platinum Trail — GTA VI Trophy Guide & Tracker

An offline web app that is the best guide and tracker for the 55
PlayStation 5 trophies of Grand Theft Auto VI: the official list with
names, descriptions and grades, a checklist saved in the browser, export
and import, filters by grade and kind, a spoiler setting that hides story
trophies until they are earned, a seven-stage road to the Platinum, a
flag on the one trophy you can possibly miss, and a guide in our own
words for every trophy with its sources cited.

## The list

55 trophies: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze. All offline,
single-player, no online trophies. One playthrough is enough.

Rockstar has not published an official list. The names, descriptions and
grades here are the list reported on 18 November 2026 by Push Square and
cross-checked against EGamers, GTAScoop, GameMapa and Mobalytics, which
all report the same 55 trophies and the same grade split.

## The one missable trophy

**Positive Mental Attitude** (meditate at every spot across Leonida) is
the only trophy the published guides flag as possibly missable. The first
meditation is Lucia on the balcony at Jason's house in Chapter 1, and it
is reported to disappear once that chapter ends. Whether it counts toward
the 18 is unconfirmed, so the guide says to do it in Chapter 1. The app
flags it on the checklist, in the banner at the top, and in its own guide.

## The roadmap

Seven stages: (1) before you start — cheats off, Chapter 1 meditation;
(2) play the story — 12 story trophies; (3) stranger missions as they
appear; (4) try every activity once, then shooting-range golds, drone
races and races; (5) collections — cards, WAiNK scans, vehicles,
meditations; (6) crime and money — vaults, trucks, shops, garages;
(7) the 100% checklist for A Long Road, then the Platinum.

## Run it

Static files under `app/` — no build step, no network at run time:

```
node serve.ts          # serves app/ at http://localhost:8080
```

Open `app/index.html` in a desktop browser. Progress is saved in the
browser's local storage; Export downloads a JSON copy, Import loads one
back.

## Hand in

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with `buildDossier` from
`vendor/makefun-frontend.ts`:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- Push Square, "GTA 6: Trophy Guide & Roadmap" (published 2026-11-18) —
  https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap
- EGamers, "GTA 6 Trophy List: All 55 Trophies And Achievements" —
  https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/
- GTAScoop, "GTA 6 Trophies & Achievements: Full List of 55 and Platinum" —
  https://gtascoop.com/guides/gta-6-trophies-achievements/
- GameMapa, "All 55 GTA 6 Trophies: Full List, Gamerscore and Platinum Roadmap" —
  https://gamemapa.com/en/gta-6/guides/gta-6-trophy-achievement-list/
- Mobalytics, "Grand Theft Auto 6 - Full Trophy List & Walkthrough" (updated 2026-11-20) —
  https://mobalytics.gg/gamebase/guides/grand-theft-auto-6-all-trophies

Guide text is written in our own words from the official descriptions
and the counts those guides report. Five hidden trophies are still
unsolved in the published guides (In the Beginning..., Capital Offense,
Bad Luck, I Guess, The Truth Is Out There, Ten Pin); their entries say
so honestly instead of guessing a method.

## Licence

MIT — see LICENSE. Unofficial fan-made guide; Grand Theft Auto and GTA
are trademarks of Take-Two Interactive. No Rockstar logo or official
artwork is used anywhere in this app.
