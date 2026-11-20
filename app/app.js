/* Platinum Trail — GTA VI trophy guide and tracker.
   Plain client-side app: loads the local trophy data, renders the
   checklist, saves progress in this browser, and never talks to the
   network at run time. */

const DATA_URL = "data/trophies.json";
const STORE_KEY = "platinum-trail-progress-v1";
const DEMO_EARNED = [
  "just-like-paradise", "paradise-lost", "vice-city-baby",
  "trust", "break-the-bank", "master-of-none", "top-fun",
  "baited-my-tackle", "stick-fiddler", "whip-it-good",
  "treat-yo-self", "on-the-spot",
];

const state = {
  trophies: [],
  counts: {},
  sources: [],
  earned: new Set(),
  grade: "all",
  kind: "all",
  query: "",
  spoilersHidden: false,
  earnedOnly: false,
  demo: false,
};

const $ = (sel) => document.querySelector(sel);

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === "string"));
  } catch (err) {
    return new Set();
  }
}

function saveProgress() {
  if (state.demo) return; // demo mode never writes to storage
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...state.earned].sort()));
  } catch (err) {
    /* Storage full or blocked: the tracker still works in memory. */
  }
}

function gradeBadge(grade) {
  return `<span class="badge badge-${grade}">${grade}</span>`;
}

function kindLabel(kind) {
  const labels = {
    story: "Story",
    completion: "Completion",
    collection: "Collection",
    activity: "Activity",
    stranger: "Stranger missions",
    crime: "Crime",
    exploration: "Exploration",
    money: "Money & property",
  };
  return labels[kind] || kind;
}

function trophyVisible(t) {
  if (state.grade !== "all" && t.grade !== state.grade) return false;
  if (state.kind !== "all" && t.kind !== state.kind) return false;
  if (state.earnedOnly && !state.earned.has(t.id)) return false;
  if (state.query) {
    const hay = `${t.name} ${t.desc} ${t.guide}`.toLowerCase();
    if (!hay.includes(state.query)) return false;
  }
  return true;
}

function renderProgress() {
  const total = state.trophies.length;
  const done = state.earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $("#progressText").textContent = `${done} of ${total} trophies earned`;
  $("#progressPct").textContent = `${pct}%`;
  $("#progressFill").style.width = `${pct}%`;
  const parts = ["platinum", "gold", "silver", "bronze"].map((g) => {
    const n = state.trophies.filter((t) => t.grade === g && state.earned.has(t.id)).length;
    const all = state.trophies.filter((t) => t.grade === g).length;
    return `${g[0].toUpperCase()}${g.slice(1)} ${n}/${all}`;
  });
  $("#progressCounts").textContent = parts.join("  ·  ");
}

function renderList() {
  const list = $("#trophyList");
  list.innerHTML = "";
  let shown = 0;
  for (const t of state.trophies) {
    if (!trophyVisible(t)) continue;
    shown += 1;
    const earned = state.earned.has(t.id);
    const spoilerHidden = state.spoilersHidden && t.story && !earned;
    const li = document.createElement("li");
    li.className = `trophy${earned ? " earned" : ""}${spoilerHidden ? " spoiler-hidden" : ""}`;
    li.dataset.id = t.id;

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = earned;
    check.setAttribute("aria-label", `Mark ${t.name} as earned`);
    check.addEventListener("change", () => {
      if (check.checked) state.earned.add(t.id);
      else state.earned.delete(t.id);
      saveProgress();
      renderProgress();
      renderList();
    });

    const body = document.createElement("div");
    const name = document.createElement("p");
    name.className = "trophy-name";
    name.textContent = spoilerHidden ? "Story trophy — hidden until earned" : t.name;
    const desc = document.createElement("p");
    desc.className = "trophy-desc";
    desc.textContent = spoilerHidden ? "Hidden by the spoiler setting." : t.desc;
    const meta = document.createElement("div");
    meta.className = "trophy-meta";
    meta.innerHTML = `${gradeBadge(t.grade)}<span class="tag">${kindLabel(t.kind)}</span>` +
      (t.missable ? `<span class="tag tag-missable">Possibly missable</span>` : "") +
      (t.story && t.kind !== "story" ? `<span class="tag tag-story">Story</span>` : "") +
      (t.unsolved ? `<span class="tag tag-unsolved">Unsolved in guides</span>` : "");
    body.append(name, desc, meta);

    const guideBtn = document.createElement("button");
    guideBtn.type = "button";
    guideBtn.className = "guide-btn";
    guideBtn.textContent = "Guide";
    guideBtn.addEventListener("click", () => openDetail(t.id));

    li.append(check, body, guideBtn);
    list.append(li);
  }
  $("#emptyNote").hidden = shown !== 0;
  $("#listHeading").textContent =
    state.grade === "all" && state.kind === "all" && !state.query
      ? "All 55 trophies"
      : `${shown} troph${shown === 1 ? "y" : "ies"} shown`;
}

function renderSources() {
  const ul = $("#sourceList");
  ul.innerHTML = "";
  for (const s of state.sources) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = s.url;
    a.textContent = s.site;
    a.rel = "noopener";
    li.append(a, document.createTextNode(` — ${s.note}`));
    ul.append(li);
  }
}

function openDetail(id) {
  const t = state.trophies.find((x) => x.id === id);
  if (!t) return;
  const panel = $("#detailPanel");
  const body = $("#detailBody");
  body.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = t.name;
  const official = document.createElement("p");
  official.className = "official";
  official.textContent = `${t.grade[0].toUpperCase()}${t.grade.slice(1)} — “${t.desc}”`;
  const guide = document.createElement("p");
  guide.className = "guide-text";
  guide.textContent = t.guide;
  body.append(title, official, guide);
  if (t.missable && t.missableReason) {
    const note = document.createElement("p");
    note.className = "missable-note";
    note.textContent = `Possibly missable: ${t.missableReason}`;
    body.append(note);
  }
  if (t.unsolved) {
    const note = document.createElement("p");
    note.className = "missable-note";
    note.textContent = "Still unsolved in the published guides as of 18 November 2026: the description above is all the guides agree on, and the method is not confirmed yet.";
    body.append(note);
  }
  const cite = document.createElement("p");
  cite.className = "cite";
  cite.textContent = `Sources: ${t.sources.join(", ")} — full links in the Sources section below.`;
  body.append(cite);
  panel.hidden = false;
  window.scrollTo(0, panel.offsetTop - 10);
}

function closeDetail() {
  $("#detailPanel").hidden = true;
}

function exportProgress() {
  const payload = {
    app: "platinum-trail",
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "platinum-trail-progress.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error("not a progress file");
      const known = new Set(state.trophies.map((t) => t.id));
      const kept = ids.filter((id) => known.has(id));
      state.earned = new Set(kept);
      saveProgress();
      renderProgress();
      renderList();
    } catch (err) {
      alert("That file is not a Platinum Trail progress export.");
    }
  };
  reader.readAsText(file);
}

function applyUrlState() {
  const params = new URLSearchParams(location.search);
  state.demo = params.get("demo") === "1";
  if (state.demo) {
    state.earned = new Set(DEMO_EARNED.filter((id) => state.trophies.some((t) => t.id === id)));
  }
  const view = params.get("view");
  const detail = params.get("detail");
  if (detail) {
    openDetail(detail);
  } else if (view === "roadmap") {
    window.scrollTo(0, $("#roadmapSection").offsetTop - 10);
  } else if (view === "missable") {
    openDetail("positive-mental-attitude");
  }
}

function bindControls() {
  $("#searchBox").addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    renderList();
  });
  $("#gradeFilters").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-grade]");
    if (!btn) return;
    state.grade = btn.dataset.grade;
    document.querySelectorAll("#gradeFilters button").forEach((b) => b.classList.toggle("active", b === btn));
    renderList();
  });
  $("#kindFilter").addEventListener("change", (e) => {
    state.kind = e.target.value;
    renderList();
  });
  $("#spoilerToggle").addEventListener("change", (e) => {
    state.spoilersHidden = e.target.checked;
    renderList();
  });
  $("#earnedOnly").addEventListener("change", (e) => {
    state.earnedOnly = e.target.checked;
    renderList();
  });
  $("#exportBtn").addEventListener("click", exportProgress);
  $("#importBtn").addEventListener("click", () => $("#importFile").click());
  $("#importFile").addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = "";
  });
  $("#detailClose").addEventListener("click", closeDetail);
  $("#missableOpen").addEventListener("click", () => openDetail("positive-mental-attitude"));
}

async function main() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`could not load ${DATA_URL}: ${res.status}`);
  const data = await res.json();
  state.trophies = data.trophies;
  state.counts = data.counts;
  state.sources = data.sources;
  // Read the URL state first: demo mode sets the earned set in memory.
  const params = new URLSearchParams(location.search);
  state.demo = params.get("demo") === "1";
  if (state.demo) {
    state.earned = new Set(DEMO_EARNED.filter((id) => state.trophies.some((t) => t.id === id)));
  } else {
    state.earned = loadProgress();
  }
  bindControls();
  renderSources();
  renderProgress();
  renderList();
  applyUrlState();
}

main().catch((err) => {
  const list = $("#trophyList");
  if (list) list.innerHTML = `<li class="trophy"><div><p class="trophy-name">The trophy list could not be loaded</p><p class="trophy-desc">${err.message}</p></div></li>`;
});
