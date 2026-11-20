const STORE_KEY = "platinum-trail-progress-v1";
let data = null;
let earned = new Set();
let gradeFilter = "all";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) earned = new Set(JSON.parse(raw));
  } catch (e) { earned = new Set(); }
}
function saveProgress() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify([...earned])); } catch (e) {}
}

function gradeLabel(g) {
  return g === "platinum" ? "Platinum" : g.charAt(0).toUpperCase() + g.slice(1);
}

function visibleTrophies() {
  const q = (document.getElementById("search").value || "").trim().toLowerCase();
  const cat = document.getElementById("category").value;
  const hideSpoilers = document.getElementById("spoiler").checked;
  const missableOnly = document.getElementById("missable-only").checked;
  const unearnedOnly = document.getElementById("unearned-only").checked;
  return data.trophies.filter(function (t) {
    if (gradeFilter !== "all" && t.grade !== gradeFilter) return false;
    if (cat !== "all" && t.category !== cat) return false;
    if (hideSpoilers && t.hidden) return false;
    if (missableOnly && !t.missable) return false;
    if (unearnedOnly && earned.has(t.id)) return false;
    if (q && (t.name + " " + t.trigger).toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}

function render() {
  const list = visibleTrophies();
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  document.getElementById("result-count").textContent =
    list.length + " of " + data.trophies.length + " trophies shown";
  document.getElementById("progress-text").textContent =
    earned.size + " / " + data.trophies.length + " earned";
  document.getElementById("progress-fill").style.width =
    Math.round((earned.size / data.trophies.length) * 100) + "%";
  list.forEach(function (t) {
    const card = document.createElement("article");
    card.className = "card" + (earned.has(t.id) ? " earned" : "");
    const badges = [];
    if (t.hidden) badges.push('<span class="badge hidden">Hidden</span>');
    if (t.missable) badges.push('<span class="badge">Missable</span>');
    if (t.unconfirmed) badges.push('<span class="badge unconfirmed">Trigger unconfirmed</span>');
    card.innerHTML =
      '<div class="card-top"><span class="grade ' + t.grade + '">' + gradeLabel(t.grade) + '</span>' +
      '<span class="gs">' + t.gamerscore + 'G</span></div>' +
      '<h3 class="card-name"></h3>' +
      '<p class="card-trigger"></p>' +
      (badges.length ? '<div class="badges">' + badges.join("") + '</div>' : "") +
      '<label><input type="checkbox" ' + (earned.has(t.id) ? "checked" : "") + '> Earned</label>';
    card.querySelector(".card-name").textContent = t.name;
    card.querySelector(".card-trigger").textContent = t.trigger;
    card.querySelector("input").addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (ev.target.checked) earned.add(t.id); else earned.delete(t.id);
      saveProgress();
      render();
    });
    card.addEventListener("click", function () { showDetail(t); });
    grid.appendChild(card);
  });
}

function showDetail(t) {
  const panel = document.getElementById("detail");
  document.getElementById("detail-name").textContent = t.name;
  document.getElementById("detail-meta").textContent =
    gradeLabel(t.grade) + " · " + t.gamerscore + "G · " + t.category +
    (t.hidden ? " · Hidden" : "") + (t.missable ? " · Missable" : "");
  document.getElementById("detail-trigger").textContent = t.trigger;
  const note = document.getElementById("detail-note");
  if (t.id === "positive-mental-attitude") {
    note.textContent = "Do the Chapter 1 balcony meditation with Lucia — it cannot be repeated after Chapter 1.";
  } else if (t.unconfirmed) {
    note.textContent = "This trophy's exact trigger is still unconfirmed in the published lists. The guide states what is known and invents nothing.";
  } else {
    note.textContent = "";
  }
  panel.hidden = false;
  panel.scrollIntoView({ block: "nearest" });
}

function bind() {
  document.getElementById("search").addEventListener("input", render);
  document.getElementById("category").addEventListener("change", render);
  document.getElementById("spoiler").addEventListener("change", render);
  document.getElementById("missable-only").addEventListener("change", render);
  document.getElementById("unearned-only").addEventListener("change", render);
  document.querySelectorAll("#grade-filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("#grade-filters button").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      gradeFilter = b.getAttribute("data-grade");
      render();
    });
  });
  document.getElementById("detail-close").addEventListener("click", function () {
    document.getElementById("detail").hidden = true;
  });
  document.getElementById("export").addEventListener("click", function () {
    const blob = new Blob([JSON.stringify({ earned: [...earned] }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "platinum-trail-progress.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById("import").addEventListener("click", function () {
    document.getElementById("import-file").click();
  });
  document.getElementById("import-file").addEventListener("change", function (ev) {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed.earned)) {
          earned = new Set(parsed.earned.filter(function (id) {
            return data.trophies.some(function (t) { return t.id === id; });
          }));
          saveProgress();
          render();
        }
      } catch (e) {}
    };
    reader.readAsText(f);
  });
  document.getElementById("reset").addEventListener("click", function () {
    if (window.confirm("Clear all earned trophies?")) {
      earned = new Set();
      saveProgress();
      render();
    }
  });
}

function applyHash() {
  const hash = window.location.hash;
  if (hash === "#roadmap") {
    document.getElementById("roadmap").scrollIntoView();
  } else if (hash === "#missable") {
    document.getElementById("missable").scrollIntoView();
  } else if (hash === "#detail") {
    const target = data.trophies.find(function (t) { return t.id === "a-long-road"; });
    if (target) showDetail(target);
  }
}

fetch("data/trophies.json")
  .then(function (r) { return r.json(); })
  .then(function (json) {
    data = json;
    loadProgress();
    bind();
    render();
    applyHash();
    window.addEventListener("hashchange", applyHash);
  })
  .catch(function (e) {
    document.getElementById("grid").innerHTML =
      "<p>Could not load the trophy list. Serve this folder over HTTP (for example: node serve.ts) and reload.</p>";
  });
