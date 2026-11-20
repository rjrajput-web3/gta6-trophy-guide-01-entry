// Platinum Trail — entrypoint for gta6-trophy-guide-01.
//
// Copies the guide (app/) and its screenshots (screenshots/) into the
// output directory, then writes /output/dossier.json with buildDossier
// from the vendored make.fun frontend library. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output. Node 22, standard library
// only: nothing is installed before this runs.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const ROOT = new URL(".", import.meta.url).pathname;

function copyTree(name: string): void {
  const from = join(ROOT, name);
  const to = join(OUT_DIR, name);
  if (!existsSync(from)) throw new Error(`missing ${name}/ in the repository`);
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(OUT_DIR, { recursive: true });
copyTree("app");
copyTree("screenshots");

const dossier = buildDossier(OUT_DIR, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(OUT_DIR, "dossier.json"), dossier);
console.log(`wrote ${join(OUT_DIR, "dossier.json")} (${dossier.length} bytes)`);
