const DATA_URL = "data/trophies.json";
const STORAGE_KEY = "vice-city-trophy-atlas-v1";

const GRADE_POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };
const GRADE_LABELS = { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" };
const KIND_LABELS = { story: "Story", collectible: "Collectible", activity: "Activity", online: "Online" };

const STAGES = [
  { n: 1, title: "Opening: Chapters 1 and 2", blurb: "Play the opening chapters and the first story missions. Nothing here needs grinding, just follow the plot." },
  { n: 2, title: "Vice City and the finale", blurb: "Chapters 3 and 4, the final mission, and the partner jobs that only happen while the story is in this stretch." },
  { n: 3, title: "Strangers and side missions", blurb: "Finish the contact strands for Andy, Kenton, Billy, Randy and Tyrone, plus 8 stranger strands across Leonida." },
  { n: 4, title: "Activities, feats and crime", blurb: "The long free-roam middle: ranges, races, robberies, stunts and one-off feats. Do these in any order." },
  { n: 5, title: "Collectibles and exploring Leonida", blurb: "Meditation spots, cards, WAiNK locations, vehicles, areas and garages. Best done with the map open and the tracker ticking." },
  { n: 6, title: "The long road: 100% and platinum", blurb: "Sweep up whatever is left until the completion counter hits 100%. The platinum pops with the last trophy." }
];

const state = loadState();
let trophies = [];
let activeKind = "all";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: [], spoiler: false };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((id) => Number.isInteger(id)) : [],
      spoiler: parsed.spoiler === true
    };
  } catch {
    return { earned: [], spoiler: false };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isEarned(id) {
  return state.earned.includes(id);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function trophyPoints(t) {
  return GRADE_POINTS[t.grade] || 0;
}

function stageOf(t) {
  return STAGES.find((s) => s.n === t.stage) || STAGES[0];
}

function $(id) {
  return document.getElementById(id);
}

function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function renderStats() {
  const earned = trophies.filter((t) => isEarned(t.id));
  const points = earned.reduce((sum, t) => sum + trophyPoints(t), 0);
  const pct = trophies.length === 0 ? 0 : Math.round((earned.length / trophies.length) * 100);
  $("earned-count").textContent = String(earned.length);
  $("points-count").textContent = String(points);
  $("percent-count").textContent = pct + "%";
  $("progress-fill").style.width = pct + "%";
  $("progress-bar").setAttribute("aria-valuenow", String(earned.length));
  $("progress-bar").setAttribute("aria-valuemax", String(trophies.length));
  $("progress-note").textContent =
    earned.length === 0
      ? "Tick a trophy when you earn it. Your progress is saved in this browser."
      : earned.length === trophies.length
        ? "Leonida Legend: every trophy earned. The platinum is yours."
        : earned.length + " of 55 earned. " + (trophies.length - earned.length) + " to go — the missable list is the safest place to start.";
  const counts = $("grade-counts");
  counts.innerHTML = "";
  for (const grade of ["platinum", "gold", "silver", "bronze"]) {
    const total = trophies.filter((t) => t.grade === grade).length;
    const got = earned.filter((t) => t.grade === grade).length;
    const span = el("span", "", "<b>" + got + " / " + total + "</b> " + GRADE_LABELS[grade]);
    counts.appendChild(span);
  }
}

function spoilerHides(t) {
  return state.spoiler && t.kind === "story" && !isEarned(t.id);
}

function trophyCard(t) {
  const card = el("article", "trophy-card" + (isEarned(t.id) ? " is-earned" : ""));
  if (spoilerHides(t)) card.classList.add("spoiler-hidden");
  const top = el("div", "card-top",
    '<span class="grade-badge grade-' + t.grade + '">' + GRADE_LABELS[t.grade] + "</span>" +
    '<span class="kind-tag">' + KIND_LABELS[t.kind] + "</span>");
  card.appendChild(top);
  if (t.missable) card.appendChild(el("span", "missable-flag", "Missable — do it on your first pass"));
  card.appendChild(el("h3", "trophy-name", escapeHtml(t.name)));
  card.appendChild(el("p", "spoiler-note", "Hidden story trophy — earn it in the game to reveal its name and guide."));
  card.appendChild(el("p", "trophy-desc", escapeHtml(t.description)));
  card.appendChild(el("p", "trophy-guide", "<strong>Guide:</strong> " + escapeHtml(t.guide)));
  const steps = el("ol", "steps");
  for (const step of t.steps || []) steps.appendChild(el("li", "", escapeHtml(step)));
  card.appendChild(steps);
  card.appendChild(el("p", "card-sources", "<strong>Sources:</strong> " + (t.sources || []).map(escapeHtml).join(" · ")));
  const actions = el("div", "card-actions");
  const earnBtn = el("button", "earn-btn" + (isEarned(t.id) ? " is-earned" : ""), isEarned(t.id) ? "Earned ✓" : "Mark earned");
  earnBtn.type = "button";
  earnBtn.addEventListener("click", () => toggleEarned(t.id));
  actions.appendChild(earnBtn);
  const detailLink = el("a", "details-link", "Full guide →");
  detailLink.href = "#/trophy-" + t.id;
  actions.appendChild(detailLink);
  card.appendChild(actions);
  return card;
}

function currentFilters() {
  return {
    query: $("search").value.trim().toLowerCase(),
    kind: activeKind,
    grade: $("grade-filter").value,
    sort: $("sort-order").value,
    unearnedOnly: $("earned-only").checked
  };
}

function filteredTrophies() {
  const f = currentFilters();
  let list = trophies.slice();
  if (f.kind === "missable") list = list.filter((t) => t.missable);
  else if (f.kind === "online") list = [];
  else if (f.kind !== "all") list = list.filter((t) => t.kind === f.kind);
  if (f.grade !== "all") list = list.filter((t) => t.grade === f.grade);
  if (f.unearnedOnly) list = list.filter((t) => !isEarned(t.id));
  if (f.query) {
    list = list.filter((t) =>
      (t.name + " " + t.description + " " + t.guide).toLowerCase().includes(f.query));
  }
  const gradeRank = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  if (f.sort === "grade") list.sort((a, b) => gradeRank[a.grade] - gradeRank[b.grade] || a.id - b.id);
  else if (f.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  else if (f.sort === "missing") list.sort((a, b) => Number(isEarned(a.id)) - Number(isEarned(b.id)) || a.id - b.id);
  else list.sort((a, b) => a.stage - b.stage || a.id - b.id);
  return { list, kind: f.kind };
}

function renderList() {
  const grid = $("trophy-grid");
  grid.innerHTML = "";
  const { list, kind } = filteredTrophies();
  for (const t of list) grid.appendChild(trophyCard(t));
  $("empty-state").hidden = list.length !== 0;
  if (kind === "online" && list.length === 0) {
    $("empty-state").hidden = false;
    $("empty-state").textContent = "The official list holds no online trophies: all 55 are earned in single-player story and free roam.";
  } else if (list.length === 0) {
    $("empty-state").textContent = "No trophies match these filters. Try clearing the search or choosing another kind.";
  }
  $("result-count").textContent = "Showing " + list.length + " of " + trophies.length + " trophies";
}

function renderRoadmap() {
  const host = $("roadmap-stages");
  host.innerHTML = "";
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.n);
    const earned = members.filter((t) => isEarned(t.id)).length;
    const box = el("div", "roadmap-stage");
    box.appendChild(el("h3", "", '<span class="stage-num">' + stage.n + "</span>" + escapeHtml(stage.title)));
    box.appendChild(el("p", "", escapeHtml(stage.blurb) + " — " + earned + " of " + members.length + " earned."));
    const ul = el("ul");
    for (const t of members) {
      const li = el("li", "",
        '<span class="grade-dot">' + GRADE_LABELS[t.grade] + "</span> — " +
        (spoilerHides(t) ? "Hidden story trophy" : escapeHtml(t.name)) +
        (t.missable ? " <strong>(missable)</strong>" : "") +
        (isEarned(t.id) ? " ✓" : ""));
      ul.appendChild(li);
    }
    box.appendChild(ul);
    host.appendChild(box);
  }
}

function renderMissable() {
  const grid = $("missable-grid");
  grid.innerHTML = "";
  for (const t of trophies.filter((t) => t.missable)) grid.appendChild(trophyCard(t));
}

function renderDetail(id) {
  const t = trophies.find((x) => x.id === id);
  const body = $("detail-body");
  if (!t) {
    body.innerHTML = "<h2>Trophy not found</h2><p>That trophy is not in the official list of 55.</p>";
    return;
  }
  const stage = stageOf(t);
  body.innerHTML =
    '<span class="grade-badge grade-' + t.grade + '">' + GRADE_LABELS[t.grade] + "</span> " +
    '<span class="kind-tag">' + KIND_LABELS[t.kind] + "</span>" +
    (t.missable ? ' <span class="missable-flag">Missable — do it on your first pass</span>' : "") +
    "<h2>" + escapeHtml(t.name) + "</h2>" +
    '<p class="trophy-desc">' + escapeHtml(t.description) + "</p>" +
    "<p><strong>Roadmap:</strong> Stage " + stage.n + " — " + escapeHtml(stage.title) + "</p>" +
    "<h3>Guide</h3><p>" + escapeHtml(t.guide) + "</p>" +
    "<h3>Steps</h3><ol class='steps'>" + (t.steps || []).map((s) => "<li>" + escapeHtml(s) + "</li>").join("") + "</ol>" +
    "<h3>Sources</h3><p>" + (t.sources || []).map(escapeHtml).join(" · ") + "</p>" +
    "<p><button type='button' class='earn-btn" + (isEarned(t.id) ? " is-earned" : "") + "' id='detail-earn'>" +
    (isEarned(t.id) ? "Earned ✓" : "Mark earned") + "</button></p>";
  $("detail-earn").addEventListener("click", () => {
    toggleEarned(t.id);
    renderDetail(id);
  });
}

function showView(name) {
  for (const view of ["list", "roadmap", "missable", "sources", "detail"]) {
    $("view-" + view).hidden = view !== name;
  }
  $("toolbar").hidden = name !== "list";
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.route === (name === "list" ? "" : name) || (name === "detail" && tab.dataset.route === ""));
  });
}

function route() {
  const hash = location.hash || "#/";
  if (hash === "#/" || hash === "#") { showView("list"); return; }
  if (hash === "#/roadmap") { renderRoadmap(); showView("roadmap"); return; }
  if (hash === "#/missable") { renderMissable(); showView("missable"); return; }
  if (hash === "#/sources") { showView("sources"); return; }
  const match = /^#\/trophy-(\d+)$/.exec(hash);
  if (match) { renderDetail(Number(match[1])); showView("detail"); return; }
  showView("list");
}

function toggleEarned(id) {
  const at = state.earned.indexOf(id);
  if (at >= 0) state.earned.splice(at, 1);
  else state.earned.push(id);
  saveState();
  renderStats();
  renderList();
}

function exportProgress() {
  const payload = {
    guide: "Vice City Trophy Atlas — GTA VI",
    exportedAt: new Date().toISOString(),
    earned: state.earned.slice().sort((a, b) => a - b),
    spoiler: state.spoiler
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gta6-trophy-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const earned = Array.isArray(data.earned) ? data.earned.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55) : null;
      if (earned === null) throw new Error("bad file");
      state.earned = earned;
      if (typeof data.spoiler === "boolean") state.spoiler = data.spoiler;
      saveState();
      syncControls();
      renderStats();
      renderList();
      route();
    } catch {
      alert("That file is not a progress export from this guide.");
    }
  };
  reader.readAsText(file);
}

function syncControls() {
  $("spoiler-toggle").checked = state.spoiler;
}

function bindControls() {
  $("search").addEventListener("input", renderList);
  $("grade-filter").addEventListener("change", renderList);
  $("sort-order").addEventListener("change", renderList);
  $("earned-only").addEventListener("change", renderList);
  $("spoiler-toggle").addEventListener("change", (e) => {
    state.spoiler = e.target.checked;
    saveState();
    renderList();
  });
  document.querySelectorAll("#kind-chips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeKind = chip.dataset.kind;
      document.querySelectorAll("#kind-chips .chip").forEach((c) => c.classList.toggle("is-active", c === chip));
      renderList();
    });
  });
  $("export-btn").addEventListener("click", exportProgress);
  $("import-btn").addEventListener("click", () => $("import-file").click());
  $("import-file").addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = "";
  });
  $("reset-btn").addEventListener("click", () => {
    if (confirm("Clear all earned trophies? This cannot be undone.")) {
      state.earned = [];
      saveState();
      renderStats();
      renderList();
    }
  });
  $("back-btn").addEventListener("click", () => { location.hash = "#/"; });
  window.addEventListener("hashchange", route);
}

async function boot() {
  bindControls();
  syncControls();
  try {
    const res = await fetch(DATA_URL);
    const data = await res.json();
    trophies = data.trophies || data;
  } catch {
    $("trophy-grid").innerHTML = "<p class='empty'>The trophy data could not be loaded. Serve this guide over HTTP and try again.</p>";
    return;
  }
  renderStats();
  renderList();
  route();
}

boot();
