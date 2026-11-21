// Platinum Trail — hand-in program for the gta6-trophy-guide-01 competition.
// Node 22, standard library only. It collects this repo's app/ folder and
// screenshots/ folder into the output directory and writes the dossier.json
// the make.fun judge reads, using the vendored library.
//
// Run it directly:
//
//   node main.ts
//
// Outside the grader, MAKEFUN_OUTPUT_DIR replaces /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function mirrorTree(source, target) {
  mkdirSync(target, { recursive: true });
  if (existsSync(source)) cpSync(source, target, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
mirrorTree(join(repoRoot, 'app'), join(outDir, 'app'));
mirrorTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));

// The scorer's caps for this competition: at most 4 screenshots, each under
// 256 KiB; the app tree under 993 files and 48 MiB in total; the dossier
// text under 160 KiB. The library itself builds the dossier, so what the
// judge rebuilds later matches these bytes exactly.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`dossier written to ${join(outDir, 'dossier.json')}`);
