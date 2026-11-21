// Platinum Trail — hand-in program for the gta6-trophy-guide-01 competition.
//
// Node 22, standard library only, no install step. Running this file copies
// the entry's app/ folder and screenshots/ folder into the output directory
// and writes dossier.json there with the vendored make.fun library
// (vendor/makefun-frontend.ts). The dossier is built by that library and
// never assembled by hand, so the bytes handed in are exactly the bytes the
// scorer rebuilds from the same folders.
//
//   node main.ts
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTree(join(here, "app"), join(outDir, "app"));
copyTree(join(here, "screenshots"), join(outDir, "screenshots"));

// Competition caps, mirrored so an over-limit entry fails here first:
// at most 4 screenshots of at most 256 KiB each, an app tree of at most
// 993 entries and 48 MiB, and dossier text of at most 160 KiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(outDir, "dossier.json"), dossier);
console.log("dossier written to " + join(outDir, "dossier.json"));
