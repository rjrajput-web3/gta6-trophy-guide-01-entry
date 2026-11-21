// Platinum Trail — GTA VI Trophy Guide & Tracker: dossier builder.
//
// Counted files (8, alphabetical) hashed into dossier.json:
//   README.md, app/app.js, app/data/trophies.json, app/icon.svg,
//   app/index.html, app/style.css, main.ts, shots.json
// app/icon.svg is counted on purpose: app/index.html references it as the
// favicon, so the dossier must carry it or that reference dangles inside
// the artifact. main.ts counts itself, so its own bytes are in the dossier.
//
// Run: MAKEFUN_OUTPUT_DIR=out node main.ts
// Writes <output>/dossier.json (2-space JSON + trailing newline) and logs
// one line: "dossier.json written: <bytes> bytes, <n> counted files,
// <total> trophies". With no MAKEFUN_OUTPUT_DIR set, the dossier lands in
// this repository's root. Standard library only, no network, no writes
// outside the output directory.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = import.meta.dirname;
const ENTRY = "gta6-trophy-guide-01";

const COUNTED_FILES = [
  "README.md",
  "app/app.js",
  "app/data/trophies.json",
  "app/icon.svg",
  "app/index.html",
  "app/style.css",
  "main.ts",
  "shots.json",
];

function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function hashTextFile(relPath: string) {
  const bytes = readFileSync(join(ROOT, relPath));
  return {
    path: relPath,
    sha256: sha256Hex(bytes),
    size: bytes.length,
    content: bytes.toString("utf8"),
  };
}

function hashScreenshot(relPath: string) {
  const bytes = readFileSync(join(ROOT, relPath));
  return { path: relPath, sha256: sha256Hex(bytes), size: bytes.length };
}

function main(): void {
  const files = COUNTED_FILES.map(hashTextFile);

  const screenshotNames = readdirSync(join(ROOT, "screenshots"))
    .filter((name) => /\.(jpe?g|png)$/i.test(name))
    .sort();
  const screenshots = screenshotNames.map((name) =>
    hashScreenshot(`screenshots/${name}`),
  );

  const shotsDoc = JSON.parse(
    readFileSync(join(ROOT, "shots.json"), "utf8"),
  ) as { shots: unknown[] };
  const shots = shotsDoc.shots;

  const trophyDoc = JSON.parse(
    readFileSync(join(ROOT, "app/data/trophies.json"), "utf8"),
  ) as {
    trophies: {
      grade: string;
      hidden: boolean;
      missable: boolean;
      name: string;
    }[];
  };
  const list = trophyDoc.trophies;
  const counts: Record<string, number> = {};
  for (const trophy of list) {
    counts[trophy.grade] = (counts[trophy.grade] ?? 0) + 1;
  }
  const orderedCounts: Record<string, number> = {};
  for (const grade of Object.keys(counts).sort()) {
    orderedCounts[grade] = counts[grade];
  }
  const trophies = {
    counts: orderedCounts,
    hidden: list.filter((trophy) => trophy.hidden).length,
    missable: list.filter((trophy) => trophy.missable).map((trophy) => trophy.name),
    total: list.length,
  };

  const dossier = {
    entry: ENTRY,
    files,
    screenshots,
    shots,
    trophies,
  };

  const text = JSON.stringify(dossier, null, 2) + "\n";
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? ROOT;
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "dossier.json"), text, "utf8");
  const bytes = Buffer.byteLength(text, "utf8");
  console.log(
    `dossier.json written: ${bytes} bytes, ${files.length} counted files, ${trophies.total} trophies`,
  );
}

main();
