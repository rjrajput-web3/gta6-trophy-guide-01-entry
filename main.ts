import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const counted = [
  "README.md",
  "app/app.js",
  "app/data/trophies.json",
  "app/index.html",
  "app/style.css",
  "main.ts",
  "shots.json",
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

const files = [];
for (const rel of counted) {
  const p = join(root, rel);
  if (!existsSync(p)) continue;
  const bytes = readFileSync(p);
  files.push({ path: rel, sha256: sha256(bytes), size: bytes.length, content: bytes.toString("utf8") });
}

const trophies = JSON.parse(readFileSync(join(root, "app/data/trophies.json"), "utf8"));
const shots = JSON.parse(readFileSync(join(root, "shots.json"), "utf8"));
const shotFiles = [];
const shotsDir = join(root, "screenshots");
if (existsSync(shotsDir)) {
  for (const name of readdirSync(shotsDir).sort()) {
    const bytes = readFileSync(join(shotsDir, name));
    shotFiles.push({ path: "screenshots/" + name, sha256: sha256(bytes), size: bytes.length });
  }
}

const dossier = {
  entry: "gta6-trophy-guide-01",
  files,
  screenshots: shotFiles,
  shots: shots.shots,
  trophies: {
    counts: trophies.grades,
    hidden: trophies.hidden,
    missable: trophies.missable,
    total: trophies.total,
  },
};

const out = JSON.stringify(dossier, null, 2) + "\n";
const outDir = process.env.MAKEFUN_OUTPUT_DIR || root;
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "dossier.json"), out);
console.log("dossier.json written:", out.length, "bytes,", files.length, "counted files,", trophies.total, "trophies");
