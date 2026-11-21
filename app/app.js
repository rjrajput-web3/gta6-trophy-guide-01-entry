"use strict";
/* Platinum Trail — guide, roadmap and tracker.
   Loads app/data/trophies.json, renders the card grid and the staged
   roadmap, and keeps earned state in localStorage with export/import. */

var STORE_KEY = "platinum-trail-progress-v2";
var data = null;
var earned = new Set();
var gradeFilter = "all";
var view = "guide";
var detailId = null;

var STAGES = {
  1: {
    title: "Stage 1 — The story spine",
    blurb: "Play the campaign in order: the five chapter trophies, the named-mission trophies and the finale. Story trophies cannot be missed, and finishing the story unlocks the 100% checklist that Stage 4 is built on. Save at the start and end of every chapter."
  },
  2: {
    title: "Stage 2 — Missable & chapter-locked first",
    blurb: "Do these before anything else can close them off. Positive Mental Attitude is the game's only missable trophy — its Chapter 1 balcony meditation cannot be repeated. The stranger strands here also open in specific chapters (Cal and Kenton in Chapter 1, Billy in Chapter 2, Andy, Randy and Tyrone in Chapter 3), so start each one the chapter it opens."
  },
  3: {
    title: "Stage 3 — The open world",
    blurb: "The long middle: stunts, WAiNK scans, races, robberies, money and mischief. Almost everything here stacks — one robbery run can feed the vault count, the laundering total, the Criminal Profile and a gang operation at once — so route trips to hit several counters at a time. The six unconfirmed trophies live here too: one honest attempt at each description's plain meaning, then park them."
  },
  4: {
    title: "Stage 4 — Endgame cleanup & the platinum",
    blurb: "After the credits: work the 100% checklist screen itself, top up Challenges past 50 on the way to the 70 the checklist wants, finish both Strength stats if the gym routine slipped, and let the platinum pop on the last of the 54."
  }
};

function $(id) { return document.getElementById(id); }

function loadProgress() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) earned = new Set(JSON.parse(raw));
  } catch (e) { earned = new Set(); }
}
function saveProgress() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(earned))); } catch (e) {}
}

function gradeLabel(g) {
  return g === "platinum" ? "Platinum" : g.charAt(0).toUpperCase() + g.slice(1);
}
function dots(d) {
  var s = "";
  for (var i = 1; i <= 5; i++) s += i <= d ? "\u25CF" : "\u25CB";
  return s;
}
function totalScore(list) {
  return list.reduce(function (n, t) { return n + (t.gamerscore || 0); }, 0);
}

function updateStats() {
  var all = data.trophies;
  var pct = Math.round((earned.size / all.length) * 100);
  $("stat-earned").textContent = earned.size + " / " + all.length;
  $("stat-score").textContent =
    totalScore(all.filter(function (t) { return earned.has(t.id); })) + " G of " + totalScore(all) + " G";
  $("stat-left").textContent = String(all.length - earned.size);
  $("stat-missable").textContent = earned.has("positive-mental-attitude") ? "Earned \u2713" : "Do it in Chapter 1";
  $("progress-fill").style.width = pct + "%";
  $("ring-pct").textContent = pct + "%";
  var c = 2 * Math.PI * 52;
  $("ring-fill").style.strokeDasharray = c.toFixed(1);
  $("ring-fill").style.strokeDashoffset = (c * (1 - earned.size / all.length)).toFixed(1);
}

function guideParts(guide) {
  var stepsAt = guide.indexOf(" Steps: ");
  var tipAt = guide.lastIndexOf(" Tip: ");
  if (stepsAt === -1 || tipAt === -1 || tipAt < stepsAt) return { overview: guide, steps: [], tip: "" };
  return {
    overview: guide.slice(0, stepsAt).replace(/^Overview:\s*/, ""),
    steps: guide.slice(stepsAt + 8, tipAt).split(/\s(?=\d+\)\s)/).map(function (s) { return s.replace(/^\d+\)\s*/, "").trim(); }).filter(Boolean),
    tip: guide.slice(tipAt + 6).trim()
  };
}

function visibleTrophies() {
  var q = ($("search").value || "").trim().toLowerCase();
  var cat = $("category").value;
  var maxD = Number($("max-difficulty").value);
  var hideSpoilers = $("spoiler").checked;
  var missableOnly = $("missable-only").checked;
  var unearnedOnly = $("unearned-only").checked;
  return data.trophies.filter(function (t) {
    if (gradeFilter !== "all" && t.grade !== gradeFilter) return false;
    if (cat !== "all" && t.category !== cat) return false;
    if (t.difficulty > maxD) return false;
    if (hideSpoilers && t.hidden && !earned.has(t.id)) return false;
    if (missableOnly && !t.missable) return false;
    if (unearnedOnly && earned.has(t.id)) return false;
    if (q && (t.name + " " + t.description + " " + t.trigger + " " + t.guide).toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}

function badgesHtml(t) {
  var b = [];
  if (t.missable) b.push('<span class="badge missable">Missable</span>');
  if (t.hidden) b.push('<span class="badge hidden">Hidden</span>');
  if (t.unconfirmed) b.push('<span class="badge unconfirmed">Trigger unconfirmed</span>');
  return b.length ? '<div class="badges">' + b.join("") + "</div>" : "";
}

function cardHtml(t) {
  return '<div class="card-top"><span class="grade ' + t.grade + '">' + gradeLabel(t.grade) + '</span>' +
    '<span class="gs">' + t.gamerscore + 'G</span></div>' +
    '<h3 class="card-name"></h3>' +
    '<p class="card-desc"></p>' +
    '<p class="card-meta"><span class="dots" title="Difficulty (community estimate)">' + dots(t.difficulty) + '</span>' +
    '<span class="time">' + t.time + '</span><span class="stage-tag">Stage ' + t.stage + '</span></p>' +
    badgesHtml(t) +
    '<label class="earned-label"><input type="checkbox" ' + (earned.has(t.id) ? "checked" : "") + '> Earned</label>';
}

function toggleEarned(t, on) {
  if (on) earned.add(t.id); else earned.delete(t.id);
  saveProgress();
  render();
  if (detailId === t.id) fillDetail(t);
}

function makeCard(t) {
  var card = document.createElement("article");
  card.className = "card" + (earned.has(t.id) ? " earned" : "") + (t.missable ? " is-missable" : "");
  card.innerHTML = cardHtml(t);
  card.querySelector(".card-name").textContent = t.name;
  card.querySelector(".card-desc").textContent = t.description;
  card.querySelector("input").addEventListener("click", function (ev) {
    ev.stopPropagation();
    toggleEarned(t, ev.target.checked);
  });
  card.addEventListener("click", function () { showDetail(t); });
  return card;
}

function renderGrid() {
  var list = visibleTrophies();
  var grid = $("grid");
  grid.innerHTML = "";
  $("result-count").textContent = list.length + " of " + data.trophies.length + " trophies shown" +
    (earned.size ? " \u00B7 " + earned.size + " earned" : "");
  list.forEach(function (t) { grid.appendChild(makeCard(t)); });
  if (!list.length) grid.innerHTML = '<p class="empty">No trophies match these filters. Loosen a filter — or untick \u201CHide spoilers\u201D to see the 28 hidden trophies.</p>';
}

function renderRoadmap() {
  var wrap = $("stages");
  wrap.innerHTML = "";
  [1, 2, 3, 4].forEach(function (n) {
    var items = data.trophies.filter(function (t) { return t.stage === n; });
    var done = items.filter(function (t) { return earned.has(t.id); }).length;
    var sec = document.createElement("section");
    sec.className = "stage";
    var rows = items.map(function (t) {
      return '<li class="stage-row' + (earned.has(t.id) ? " done" : "") + '" data-id="' + t.id + '">' +
        '<label><input type="checkbox" ' + (earned.has(t.id) ? "checked" : "") + '></label>' +
        '<span class="grade ' + t.grade + '">' + gradeLabel(t.grade) + '</span>' +
        '<span class="stage-name"></span>' +
        '<span class="stage-meta">' + dots(t.difficulty) + " \u00B7 " + t.time + (t.missable ? ' \u00B7 <strong>Missable</strong>' : "") + (t.unconfirmed ? " \u00B7 Unconfirmed" : "") + "</span></li>";
    }).join("");
    sec.innerHTML = "<h3>" + STAGES[n].title + ' <span class="stage-count">' + done + " / " + items.length + "</span></h3>" +
      '<p class="stage-blurb"></p><ul class="stage-list">' + rows + "</ul>";
    sec.querySelector(".stage-blurb").textContent = STAGES[n].blurb;
    sec.querySelectorAll(".stage-row").forEach(function (row) {
      var t = data.trophies.find(function (x) { return x.id === row.getAttribute("data-id"); });
      row.querySelector(".stage-name").textContent = t.name;
      row.querySelector("input").addEventListener("change", function (ev) { toggleEarned(t, ev.target.checked); });
      row.querySelector(".stage-name").addEventListener("click", function () { setView("guide"); showDetail(t); });
    });
    wrap.appendChild(sec);
  });
}

function render() {
  updateStats();
  if (view === "roadmap") renderRoadmap(); else renderGrid();
}

function fillDetail(t) {
  detailId = t.id;
  $("detail-kicker").textContent = "Stage " + t.stage + " \u00B7 " + STAGES[t.stage].title.split(" \u2014 ")[1];
  $("detail-name").textContent = t.name;
  $("detail-desc").textContent = "\u201C" + t.description + "\u201D \u2014 official description";
  $("detail-meta").textContent = gradeLabel(t.grade) + " \u00B7 " + t.gamerscore + "G \u00B7 " + t.category +
    " \u00B7 Difficulty " + dots(t.difficulty) + " (" + t.difficulty + "/5, community estimate)" +
    " \u00B7 Time: " + t.time +
    (t.hidden ? " \u00B7 Hidden trophy" : "") + (t.missable ? " \u00B7 MISSABLE" : "") + (t.unconfirmed ? " \u00B7 Trigger unconfirmed" : "");
  $("detail-trigger").textContent = t.trigger;
  var parts = guideParts(t.guide);
  var box = $("detail-guide");
  box.innerHTML = "";
  var ov = document.createElement("p"); ov.textContent = parts.overview; box.appendChild(ov);
  if (parts.steps.length) {
    var ol = document.createElement("ol");
    parts.steps.forEach(function (s) { var li = document.createElement("li"); li.textContent = s; ol.appendChild(li); });
    box.appendChild(ol);
  }
  if (parts.tip) {
    var tip = document.createElement("p");
    tip.className = "detail-tip";
    tip.textContent = "Tip: " + parts.tip;
    box.appendChild(tip);
  }
  $("detail-source").textContent = "Sources: " + t.source + ". Guide written for Platinum Trail; official names and descriptions as PlayStation publishes them.";
  $("detail-toggle").textContent = earned.has(t.id) ? "Earned \u2713 — tap to undo" : "Mark as earned";
}

function showDetail(t) {
  fillDetail(t);
  $("detail").hidden = false;
  $("detail").scrollIntoView({ block: "nearest" });
}

function setView(v) {
  view = v;
  $("tab-guide").classList.toggle("active", v === "guide");
  $("tab-roadmap").classList.toggle("active", v === "roadmap");
  $("guide-view").hidden = v !== "guide";
  $("roadmap-view").hidden = v !== "roadmap";
  render();
}

function bind() {
  $("search").addEventListener("input", render);
  $("category").addEventListener("change", render);
  $("max-difficulty").addEventListener("change", render);
  $("spoiler").addEventListener("change", render);
  $("missable-only").addEventListener("change", render);
  $("unearned-only").addEventListener("change", render);
  document.querySelectorAll("#grade-filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("#grade-filters button").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      gradeFilter = b.getAttribute("data-grade");
      render();
    });
  });
  $("tab-guide").addEventListener("click", function () { setView("guide"); });
  $("tab-roadmap").addEventListener("click", function () { setView("roadmap"); });
  $("detail-close").addEventListener("click", function () { $("detail").hidden = true; detailId = null; });
  $("detail-toggle").addEventListener("click", function () {
    var t = data.trophies.find(function (x) { return x.id === detailId; });
    if (t) toggleEarned(t, !earned.has(t.id));
  });
  $("export").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify({ earned: Array.from(earned) }, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "platinum-trail-progress.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $("import").addEventListener("click", function () { $("import-file").click(); });
  $("import-file").addEventListener("change", function (ev) {
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(reader.result);
        var list = Array.isArray(parsed) ? parsed : parsed.earned;
        if (Array.isArray(list)) {
          earned = new Set(list.filter(function (id) {
            return data.trophies.some(function (t) { return t.id === id; });
          }));
          saveProgress();
          render();
        }
      } catch (e) {}
    };
    reader.readAsText(f);
  });
  $("reset").addEventListener("click", function () {
    if (window.confirm("Clear all earned trophies?")) {
      earned = new Set();
      saveProgress();
      render();
    }
  });
}

function applyHash() {
  var hash = window.location.hash;
  if (hash === "#roadmap") {
    setView("roadmap");
    $("roadmap-view").scrollIntoView();
  } else if (hash === "#missable") {
    setView("guide");
    $("missable").scrollIntoView();
  } else if (hash === "#detail") {
    setView("guide");
    var target = data.trophies.find(function (t) { return t.id === "positive-mental-attitude"; });
    if (target) showDetail(target);
  } else if (hash === "#silver" || hash === "#gold" || hash === "#bronze" || hash === "#platinum") {
    setView("guide");
    $("spoiler").checked = false;
    gradeFilter = hash.slice(1);
    document.querySelectorAll("#grade-filters button").forEach(function (x) {
      x.classList.toggle("active", x.getAttribute("data-grade") === gradeFilter);
    });
    render();
    $("result-count").scrollIntoView();
  }
}

fetch("data/trophies.json")
  .then(function (r) { return r.json(); })
  .then(function (json) {
    data = json.trophies ? json : { trophies: json };
    loadProgress();
    bind();
    setView("guide");
    applyHash();
    window.addEventListener("hashchange", applyHash);
  })
  .catch(function () {
    $("grid").innerHTML = "<p>Could not load the trophy list. Serve this folder over HTTP (for example: node serve.ts) and reload.</p>";
  });
