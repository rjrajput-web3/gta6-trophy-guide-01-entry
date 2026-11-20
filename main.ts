// Platinum Trail — GTA VI trophy guide entrypoint.
// Copies app/ and screenshots/ into the output directory and writes
// dossier.json with buildDossier from the kit's vendor library.
// Runs on Node 22: `MAKEFUN_OUTPUT_DIR=out node main.ts`
// (outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output).
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = new URL('.', import.meta.url).pathname;
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Caps from the competition rules (RULES.txt): app at most 993 files and
// 48 MiB, index.html at most 1 MiB, 3-4 screenshots of at most 256 KiB
// each, and the dossier at most 1.5 MiB.
const caps = {
  text_max_bytes: 1572864,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyTree(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  if (!existsSync(from)) throw new Error(`main.ts: ${name}/ is missing from the repository`);
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree('app');
copyTree('screenshots');

const dossier = buildDossier(outputDir, caps);
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Platinum Trail dossier written: ${dossier.length} bytes -> ${join(outputDir, 'dossier.json')}`);
