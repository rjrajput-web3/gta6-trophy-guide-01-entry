// Platinum Trail — GTA VI trophy guide and tracker.
// Static, offline: the only request the app makes is a fetch of its own
// data/trophies.json. Progress lives in localStorage; export and import
// move it as a plain JSON file. No network, no analytics, no cookies.
(function () {
  'use strict';

  var DATA_URL = 'data/trophies.json';
  var EARNED_KEY = 'platinum-trail-earned-v1';
  var SPOILER_KEY = 'platinum-trail-spoiler-v1';
  var POINTS = { platinum: 180, gold: 90, silver: 30, bronze: 15 };
  var GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  var TOTAL_POINTS = 1230;

  var trophies = [];
  var earned = loadEarned();
  var spoilerOn = loadSpoiler();
  var kindFilter = 'all';
  var gradeFilter = 'all';
  var query = '';

  var listEl = document.getElementById('trophy-list');
  var resultLine = document.getElementById('result-line');
  var emptyState = document.getElementById('empty-state');
  var progressFill = document.getElementById('progress-fill');
  var progressLabel = document.getElementById('progress-label');
  var pointsLabel = document.getElementById('points-label');
  var spoilerNote = document.getElementById('spoiler-note');
  var spoilerToggle = document.getElementById('spoiler-toggle');

  function loadEarned() {
    try {
      var raw = localStorage.getItem(EARNED_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) { return {}; }
  }

  function loadSpoiler() {
    try { return localStorage.getItem(SPOILER_KEY) === '1'; }
    catch (err) { return false; }
  }

  function saveEarned() {
    try { localStorage.setItem(EARNED_KEY, JSON.stringify(earned)); } catch (err) { /* storage full or blocked */ }
  }

  function saveSpoiler() {
    try { localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0'); } catch (err) { /* ignore */ }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pointsFor(trophy) { return POINTS[trophy.grade] || 0; }

  function earnedCount() {
    var n = 0;
    trophies.forEach(function (t) { if (earned[t.id]) n += 1; });
    return n;
  }

  function earnedPoints() {
    var n = 0;
    trophies.forEach(function (t) { if (earned[t.id]) n += pointsFor(t); });
    return n;
  }

  function isHiddenBySpoiler(trophy) {
    return spoilerOn && trophy.kind === 'story' && !earned[trophy.id];
  }

  function displayName(trophy) {
    return isHiddenBySpoiler(trophy) ? 'Hidden story trophy' : trophy.name;
  }

  function displayDesc(trophy) {
    return isHiddenBySpoiler(trophy) ? 'Hidden until earned — turn spoiler-safe mode off to reveal it.' : trophy.description;
  }

  function gradeLabel(grade) {
    return grade.charAt(0).toUpperCase() + grade.slice(1);
  }

  function kindLabel(kind) {
    return kind.charAt(0).toUpperCase() + kind.slice(1);
  }

  function trophyCard(trophy) {
    var li = document.createElement('li');
    li.className = 'trophy-card' + (earned[trophy.id] ? ' earned' : '') + (trophy.missable ? ' missable-flag' : '');
    var countText = trophy.count ? ' &middot; PSN count: ' + trophy.count : '';
    li.innerHTML =
      '<input type="checkbox" class="trophy-check" aria-label="Mark ' + escapeHtml(displayName(trophy)) + ' as earned"' + (earned[trophy.id] ? ' checked' : '') + '>' +
      '<div><h3 class="trophy-name"><a href="#/trophy/' + trophy.id + '">' + escapeHtml(displayName(trophy)) + '</a></h3>' +
      '<p class="trophy-desc">' + escapeHtml(displayDesc(trophy)) + '</p>' +
      '<div class="trophy-meta">' +
      '<span class="tag grade-' + trophy.grade + '">' + gradeLabel(trophy.grade) + '</span>' +
      '<span class="tag">' + kindLabel(trophy.kind) + '</span>' +
      (trophy.missable ? '<span class="tag missable">Missable</span>' : '') +
      (isHiddenBySpoiler(trophy) ? '<span class="tag hidden-note">Hidden</span>' : '') +
      '</div></div>' +
      '<div class="trophy-points"><strong>' + pointsFor(trophy) + ' pts</strong>' + escapeHtml(trophy.grade) + countText + '</div>';
    var box = li.querySelector('.trophy-check');
    box.addEventListener('change', function () {
      if (box.checked) { earned[trophy.id] = true; } else { delete earned[trophy.id]; }
      saveEarned();
      renderAll();
    });
    return li;
  }

  function filteredTrophies() {
    var q = query.trim().toLowerCase();
    var out = trophies.filter(function (t) {
      if (kindFilter === 'missable' && !t.missable) return false;
      if (kindFilter === 'online') return false;
      if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
      if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
      if (q) {
        var hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var sort = document.getElementById('sort').value;
    if (sort === 'name') {
      out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else if (sort === 'grade') {
      out.sort(function (a, b) { return GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id; });
    } else if (sort === 'kind') {
      out.sort(function (a, b) { return a.kind.localeCompare(b.kind) || a.id - b.id; });
    } else {
      out.sort(function (a, b) { return a.id - b.id; });
    }
    return out;
  }

  function renderList() {
    var shown = filteredTrophies();
    listEl.innerHTML = '';
    shown.forEach(function (t) { listEl.appendChild(trophyCard(t)); });
    emptyState.hidden = shown.length !== 0;
    if (kindFilter === 'online') {
      resultLine.textContent = 'No online trophies: the official list of 55 has no online trophy, so this filter is empty by design.';
    } else {
      resultLine.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies · ' +
        earnedCount() + ' earned · ' + earnedPoints() + ' of ' + TOTAL_POINTS + ' points.';
    }
  }

  function renderProgress() {
    var n = earnedCount();
    var pct = trophies.length ? Math.round((n / trophies.length) * 100) : 0;
    progressFill.style.width = pct + '%';
    progressLabel.textContent = n + ' of ' + trophies.length + ' earned · ' + pct + '%';
    pointsLabel.textContent = earnedPoints() + ' / ' + TOTAL_POINTS + ' trophy points';
    var pill = document.getElementById('missable-pill');
    var missableLeft = trophies.filter(function (t) { return t.missable && !earned[t.id]; }).length;
    pill.textContent = String(missableLeft);
  }

  var STAGES = [
    { n: 1, title: 'Play the story', text: 'Chapters 1 to 4 and the final mission, plus the partner trophies that need your partner beside you. Play the main missions in order; nothing here can be missed, but the two partner trophies are easiest while the story is open.' },
    { n: 2, title: 'Side strands before the finale', text: 'The five contact finales (Andy, Kenton, Billy, Randy, Tyrone), the 8 stranger strands, Bret\u2019s hunt and the choices trophy. Do all of these before the final mission — this is where the missable trophies live.' },
    { n: 3, title: 'Collectibles and exploration', text: 'Meditation spots, card sets, WAiNK locations, vehicles, the 52 areas of Leonida and the 8 garage properties. Best done as a map sweep, region by region, once fast travel is fully open.' },
    { n: 4, title: 'Activities and grinds', text: 'Races, the shooting range, drone races, stunts, challenges, vaults and the money trophies. The long counts live here: 250 stunts, 42 gold shooting-range medals, 50 challenges, $250,000 laundered and $100,000 spent.' },
    { n: 5, title: 'Platinum', text: 'Vice Got a Price! unlocks automatically once the other 54 are earned. If one trophy is holding you back, its stage above says where it belongs.' }
  ];

  function renderRoadmap() {
    var host = document.getElementById('roadmap');
    host.innerHTML = '';
    STAGES.forEach(function (stage) {
      var members = trophies.filter(function (t) { return t.stage === stage.n; });
      var li = document.createElement('li');
      var links = members.map(function (t) {
        return '<li><a href="#/trophy/' + t.id + '">' + escapeHtml(t.name) + '</a> — ' + gradeLabel(t.grade) +
          (t.missable ? ' · <span class="warn">missable</span>' : '') +
          (earned[t.id] ? ' · earned' : '') + '</li>';
      }).join('');
      li.innerHTML = '<h3>' + escapeHtml(stage.title) + ' (' + members.length + ' trophies)</h3>' +
        '<p>' + escapeHtml(stage.text) + '</p><ul>' + links + '</ul>';
      host.appendChild(li);
    });
  }

  function renderMissable() {
    var host = document.getElementById('missable-list');
    host.innerHTML = '';
    trophies.filter(function (t) { return t.missable; }).forEach(function (t) {
      host.appendChild(trophyCard(t));
    });
  }

  function renderDetail(id) {
    var trophy = null;
    trophies.forEach(function (t) { if (t.id === id) trophy = t; });
    var host = document.getElementById('detail');
    if (!trophy) {
      host.innerHTML = '<h2>Trophy not found</h2><p>There is no trophy with that number. Back to the <a href="#/">checklist</a>.</p>';
      return;
    }
    var steps = trophy.steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('');
    var sources = '<li><a href="https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/">Exophase — GTA VI trophy list</a> — official name, description and grade.</li>' +
      '<li><a href="https://psnprofiles.com/trophies/43531-grand-theft-auto-vi">PSNProfiles — GTA VI trophies</a> — grade and the count PlayStation tracks.</li>' +
      '<li>Guide notes — written for this entry from the official description, not copied from any other guide.</li>';
    host.innerHTML =
      '<h2>' + escapeHtml(trophy.name) + '</h2>' +
      '<div class="trophy-meta"><span class="tag grade-' + trophy.grade + '">' + gradeLabel(trophy.grade) + '</span>' +
      '<span class="tag">' + kindLabel(trophy.kind) + '</span>' +
      (trophy.missable ? '<span class="tag missable">Missable</span>' : '') +
      '<span class="tag">' + pointsFor(trophy) + ' points</span>' +
      (trophy.count ? '<span class="tag">PSN count: ' + trophy.count + '</span>' : '') + '</div>' +
      '<div class="official"><p><strong>Official description (PlayStation):</strong> ' + escapeHtml(trophy.description) + '</p></div>' +
      (trophy.missable ? '<p class="warn">Missable — do this before the final story mission, while the people and moments it needs are still available.</p>' : '') +
      '<h3>Guide</h3><p>' + escapeHtml(trophy.guide) + '</p>' +
      '<h3>Steps</h3><ol class="steps">' + steps + '</ol>' +
      '<div class="sources-box"><h3>Sources</h3><ul>' + sources + '</ul>' +
      '<p>Guide written for this entry from the official description; names, descriptions and grades as PlayStation publishes them.</p></div>' +
      '<p><button type="button" id="detail-toggle">' + (earned[trophy.id] ? 'Mark as not earned' : 'Mark as earned') + '</button></p>';
    document.getElementById('detail-toggle').addEventListener('click', function () {
      if (earned[trophy.id]) { delete earned[trophy.id]; } else { earned[trophy.id] = true; }
      saveEarned();
      renderAll();
      renderDetail(id);
    });
  }

  function showView(name) {
    var views = ['checklist', 'roadmap', 'missable', 'sources', 'detail'];
    views.forEach(function (v) {
      var el = document.getElementById('view-' + v);
      if (el) el.hidden = (v !== name);
    });
    document.querySelectorAll('.view-link').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-view') === name ||
        (name === 'detail' && a.getAttribute('data-view') === 'checklist'));
    });
    var toolbar = document.querySelector('.toolbar');
    toolbar.style.display = (name === 'checklist' || name === 'missable') ? '' : 'none';
  }

  function route() {
    var hash = window.location.hash || '#/';
    var match = hash.match(/^#\/trophy\/(\d+)$/);
    if (match) { showView('detail'); renderDetail(parseInt(match[1], 10)); return; }
    if (hash === '#/roadmap') { showView('roadmap'); renderRoadmap(); return; }
    if (hash === '#/missable') { showView('missable'); renderMissable(); return; }
    if (hash === '#/sources') { showView('sources'); return; }
    showView('checklist');
    renderList();
  }

  function renderAll() {
    renderProgress();
    renderList();
  }

  function exportProgress() {
    var payload = {
      app: 'platinum-trail-gta6',
      exportedAt: new Date().toISOString(),
      earned: Object.keys(earned).map(function (k) { return parseInt(k, 10); }).sort(function (a, b) { return a - b; })
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'platinum-trail-progress.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var ids = Array.isArray(data) ? data : data.earned;
        if (!Array.isArray(ids)) throw new Error('bad file');
        var next = {};
        ids.forEach(function (id) {
          var n = parseInt(id, 10);
          if (!isNaN(n)) next[n] = true;
        });
        earned = next;
        saveEarned();
        renderAll();
        route();
      } catch (err) {
        alert('That file could not be imported. Export a progress file from this guide and try that one.');
      }
    };
    reader.readAsText(file);
  }

  function bindControls() {
    document.getElementById('search').addEventListener('input', function (e) {
      query = e.target.value;
      renderList();
    });
    document.querySelectorAll('.kind-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.kind-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        kindFilter = btn.getAttribute('data-kind');
        renderList();
      });
    });
    document.getElementById('grade-filter').addEventListener('change', function (e) {
      gradeFilter = e.target.value;
      renderList();
    });
    document.getElementById('sort').addEventListener('change', renderList);
    spoilerToggle.checked = spoilerOn;
    spoilerNote.hidden = !spoilerOn;
    spoilerToggle.addEventListener('change', function () {
      spoilerOn = spoilerToggle.checked;
      saveSpoiler();
      spoilerNote.hidden = !spoilerOn;
      renderAll();
      route();
    });
    document.getElementById('export-btn').addEventListener('click', exportProgress);
    document.getElementById('import-btn').addEventListener('click', function () {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
      e.target.value = '';
    });
    document.getElementById('reset-btn').addEventListener('click', function () {
      if (window.confirm('Clear all earned trophies and start over?')) {
        earned = {};
        saveEarned();
        renderAll();
        route();
      }
    });
    window.addEventListener('hashchange', route);
  }

  fetch(DATA_URL)
    .then(function (resp) {
      if (!resp.ok) throw new Error('trophy data failed to load');
      return resp.json();
    })
    .then(function (data) {
      trophies = Array.isArray(data) ? data : data.trophies;
      trophies.sort(function (a, b) { return a.id - b.id; });
      bindControls();
      renderAll();
      route();
    })
    .catch(function () {
      listEl.innerHTML = '<li class="trophy-card"><div><h3 class="trophy-name">The trophy data did not load</h3>' +
        '<p class="trophy-desc">app/data/trophies.json could not be read. Check the file is present beside this page and reload.</p></div></li>';
    });
})();
