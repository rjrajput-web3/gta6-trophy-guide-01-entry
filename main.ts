import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const counted = [
  "README.md",
  "app/app.js",
  "app/data/trophies.json",
  "app/icon.svg",
  "app/index.html",
  "app/style.css",
  "main.ts",
  "shots.json",
];

const files = counted.map((path) => {
  const content = readFileSync(join(root, path), "utf8");
  const sha256 = createHash("sha256").update(content).digest("hex");
  return { path, sha256, size: Buffer.byteLength(content), content };
});

const screenshots = readdirSync(join(root, "screenshots"))
  .filter((name) => name.endsWith(".jpg"))
  .sort()
  .map((name) => {
    const path = `screenshots/${name}`;
    const buf = readFileSync(join(root, path));
    return { path, sha256: createHash("sha256").update(buf).digest("hex"), size: buf.length };
  });

const shotsData = JSON.parse(readFileSync(join(root, "shots.json"), "utf8"));
const shots = shotsData.shots;

const trophyData = JSON.parse(readFileSync(join(root, "app/data/trophies.json"), "utf8"));
const list = trophyData.trophies;
const counts: Record<string, number> = {};
for (const t of list) counts[t.grade] = (counts[t.grade] ?? 0) + 1;
const sortedCounts: Record<string, number> = {};
for (const grade of Object.keys(counts).sort()) sortedCounts[grade] = counts[grade];
const trophies = {
  counts: sortedCounts,
  hidden: list.filter((t) => t.hidden).length,
  missable: list.filter((t) => t.missable).map((t) => t.name),
  total: list.length,
};

const dossier = { entry: "gta6-trophy-guide-01", files, screenshots, shots, trophies };
const text = JSON.stringify(dossier, null, 2) + "\n";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? root;
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "dossier.json"), text);
console.log(`dossier.json written: ${Buffer.byteLength(text)} bytes, ${files.length} counted files, ${trophies.total} trophies`);
