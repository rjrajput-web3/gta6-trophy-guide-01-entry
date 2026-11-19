import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = process.cwd();
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

function freshOutputDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const name of ["app", "screenshots", "dossier.json"]) {
    const target = join(dir, name);
    if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  }
}

function copyEntryTree(): void {
  for (const name of ["app", "screenshots"]) {
    const source = join(repoRoot, name);
    if (!existsSync(source)) {
      throw new Error(`main.ts: ${name}/ is missing from the repository at ${repoRoot}`);
    }
    cpSync(source, join(outputDir, name), { recursive: true });
  }
}

function writeDossier(): void {
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 48 * 1024 * 1024,
    app_path_max_bytes: 1000
  });
  writeFileSync(join(outputDir, "dossier.json"), dossier);
}

freshOutputDir(outputDir);
copyEntryTree();
writeDossier();
console.log(`Wrote app/, screenshots/ and dossier.json to ${outputDir}`);
