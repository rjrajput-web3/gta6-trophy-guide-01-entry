// Platinum Trail — GTA VI trophy guide and tracker.
// Static, offline: the only request the app makes is a fetch of its own
// data/trophies.json. Progress lives in localStorage; export and import
// move it as a plain JSON file. No network, no analytics, no cookies.
// Every trophy's guide cites its sources with the 19 Nov 2026 check date,
// and the audit strip in the header states what was verified and when.
(function () {
  'use strict';

  var DATA_URL = 'data/trophies.json';
  var EARNED_KEY = 'platinum-trail-earned-v1';
  var SPOILER_KEY = 'platinum-trail-spoiler-v1';
  var SOURCES_CHECKED_ON = '19 Nov 2026';
  var OFFICIAL_TROPHY_TOTAL = 55;
  var HIDDEN_TROPHY_TOTAL = 28;
  var MISSABLE_TROPHY_TOTAL = 8;
  var PLATINUM_POINTS_TOTAL = 1230;
  var FEATURED_TROPHY_ID = 15;
  var POINTS = { platinum: 180, gold: 90, silver: 30, bronze: 15 };
  var GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

  var trophies = [];
  var earned = loadEarnedChecklist();
  var spoilerOn = loadSpoilerSetting();
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

  function loadEarnedChecklist() {
    try {
      var raw = localStorage.getItem(EARNED_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) { return {}; }
  }

  function loadSpoilerSetting() {
    try { return localStorage.getItem(SPOILER_KEY) === '1'; }
    catch (err) { return false; }
  }

  function saveEarnedChecklist() {
    try { localStorage.setItem(EARNED_KEY, JSON.stringify(earned)); } catch (err) { /* storage full or blocked */ }
  }

  function saveSpoilerSetting() {
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

  function pointsForTrophy(trophy) { return POINTS[trophy.grade] || 0; }

  function earnedTrophyCount() {
    var n = 0;
    trophies.forEach(function (t) { if (earned[t.id]) n += 1; });
    return n;
  }

  function earnedTrophyPoints() {
    var n = 0;
    trophies.forEach(function (t) { if (earned[t.id]) n += pointsForTrophy(t); });
    return n;
  }

  function isHiddenBySpoilerMode(trophy) {
    return spoilerOn && trophy.kind === 'story' && !earned[trophy.id];
  }

  function displayTrophyName(trophy) {
    return isHiddenBySpoilerMode(trophy) ? 'Hidden story trophy' : trophy.name;
  }

  function displayTrophyDescription(trophy) {
    return isHiddenBySpoilerMode(trophy) ? 'Hidden until earned — turn spoiler-safe mode off to reveal it.' : trophy.description;
  }

  function gradeLabel(grade) {
    return grade.charAt(0).toUpperCase() + grade.slice(1);
  }

  function kindLabel(kind) {
    return kind.charAt(0).toUpperCase() + kind.slice(1);
  }

  function countLabelFor(trophy) {
    if (trophy.count == null) return '';
    var label = trophy.count_label ? ' ' + trophy.count_label : '';
    return ' · PSN count: ' + trophy.count + label;
  }

  function sourcesLineFor(trophy) {
    return 'Sources: Exophase + PSNProfiles, checked ' + SOURCES_CHECKED_ON;
  }

  function renderTrophyCard(trophy) {
    var li = document.createElement('li');
    li.className = 'trophy-card' + (earned[trophy.id] ? ' earned' : '') + (trophy.missable ? ' missable-flag' : '');
    var guideExcerpt = isHiddenBySpoilerMode(trophy) ? '' :
      '<p class="trophy-guide">' + escapeHtml(trophy.guide) + '</p>';
    var missableReason = (trophy.missable && trophy.missable_reason) ?
      '<p class="trophy-why">Missable — ' + escapeHtml(trophy.missable_reason) + '</p>' : '';
    li.innerHTML =
      '<input type="checkbox" class="trophy-check" aria-label="Mark ' + escapeHtml(displayTrophyName(trophy)) + ' as earned"' + (earned[trophy.id] ? ' checked' : '') + '>' +
      '<div><h3 class="trophy-name"><a href="#/trophy/' + trophy.id + '">' + escapeHtml(displayTrophyName(trophy)) + '</a></h3>' +
      '<p class="trophy-desc">' + escapeHtml(displayTrophyDescription(trophy)) + '</p>' +
      guideExcerpt + missableReason +
      '<div class="trophy-meta">' +
      '<span class="tag grade-' + trophy.grade + '">' + gradeLabel(trophy.grade) + '</span>' +
      '<span class="tag">' + kindLabel(trophy.kind) + '</span>' +
      (trophy.missable ? '<span class="tag missable">Missable</span>' : '') +
      (isHiddenBySpoilerMode(trophy) ? '<span class="tag hidden-note">Hidden</span>' : '') +
      '</div>' +
      '<p class="trophy-source">' + escapeHtml(sourcesLineFor(trophy)) + '</p></div>' +
      '<div class="trophy-points"><strong>' + pointsForTrophy(trophy) + ' pts</strong>' + escapeHtml(trophy.grade) + countLabelFor(trophy) + '</div>';
    var box = li.querySelector('.trophy-check');
    box.addEventListener('change', function () {
      if (box.checked) { earned[trophy.id] = true; } else { delete earned[trophy.id]; }
      saveEarnedChecklist();
      renderAllChecklistViews();
    });
    return li;
  }

  function renderFeaturedCitedGuide() {
    var host = document.getElementById('featured-guide');
    if (!host) return;
    var trophy = null;
    trophies.forEach(function (t) { if (t.id === FEATURED_TROPHY_ID) trophy = t; });
    if (!trophy) return;
    var steps = trophy.steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('');
    host.innerHTML =
      '<p class="featured-kicker">Featured guide — one trophy, worked in full</p>' +
      '<h2><a href="#/trophy/' + trophy.id + '">' + escapeHtml(trophy.name) + '</a></h2>' +
      '<p class="featured-desc"><strong>Official description:</strong> ' + escapeHtml(trophy.description) + ' <span class="tag grade-' + trophy.grade + '">' + gradeLabel(trophy.grade) + '</span><span class="tag">PSN count: ' + trophy.count + ' ' + escapeHtml(trophy.count_label || '') + '</span></p>' +
      '<p>' + escapeHtml(trophy.guide) + '</p>' +
      '<ol class="steps">' + steps + '</ol>' +
      '<p class="trophy-source">' + escapeHtml(sourcesLineFor(trophy)) + ' — every guide in this list cites the same two sources.</p>';
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

  function renderSpoilerSafeChecklist() {
    var shown = filteredTrophies();
    listEl.innerHTML = '';
    shown.forEach(function (t) { listEl.appendChild(renderTrophyCard(t)); });
    emptyState.hidden = shown.length !== 0;
    if (kindFilter === 'online') {
      resultLine.textContent = 'No online trophies: the official list of 55 has no online trophy, so this filter is empty by design.';
    } else {
      resultLine.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies · ' +
        earnedTrophyCount() + ' earned · ' + earnedTrophyPoints() + ' of ' + PLATINUM_POINTS_TOTAL + ' points.';
    }
  }

  function renderProgressBar() {
    var n = earnedTrophyCount();
    var pct = trophies.length ? Math.round((n / trophies.length) * 100) : 0;
    progressFill.style.width = pct + '%';
    progressLabel.textContent = n + ' of ' + trophies.length + ' earned · ' + pct + '%';
    pointsLabel.textContent = earnedTrophyPoints() + ' / ' + PLATINUM_POINTS_TOTAL + ' trophy points';
    var pill = document.getElementById('missable-pill');
    var missableLeft = trophies.filter(function (t) { return t.missable && !earned[t.id]; }).length;
    pill.textContent = String(missableLeft);
  }

  var SEVEN_STAGE_ROADMAP = [
    { n: 1, title: 'First steps — Chapters 1 and 2', text: 'Gone Fishing and the first two chapters. Play the main missions in order; nothing here can be missed, and the opening teaches the controls you will use for the rest of the list.' },
    { n: 2, title: 'The story run — Chapters 3 and 4 to the finale', text: 'Vice City opens up, then the chapter and mission trophies run to the final mission and its gold. Before the finale, make a manual save: the finale is the point of no return for the missable trophies in stage 3.' },
    { n: 3, title: 'Missable watch — contacts, strangers and partners', text: 'The five contact finales (Andy, Kenton, Billy, Randy, Tyrone), the 8 stranger strands, Bret\u2019s hunt, the two partner trophies and the choices trophy. All 8 missable trophies live here: finish every one before the final mission, while the people and moments they need are still available.' },
    { n: 4, title: 'Collectibles and exploration sweep', text: 'Meditation spots, card sets, WAiNK locations, vehicles, the 52 areas of Leonida and the 8 garage properties. Best done as a map sweep, region by region, once fast travel is fully open.' },
    { n: 5, title: 'Activities and skill', text: 'Races, the shooting range, drone races, fishing, arcade, bowling, stunts in the moment, vaults and the other activity trophies. Try each activity type once early for Master of None, then work the skill ones one at a time.' },
    { n: 6, title: 'The long grinds', text: 'The big counted totals: 250 stunts, 50 challenges, 5 bank vaults, $250,000 laundered and $100,000 spent, plus 100% completion. Start the money grinds early and let the counters climb while you play; the 100% trophy is the finish line of the whole list.' },
    { n: 7, title: 'Platinum', text: 'Vice Got a Price! unlocks automatically once the other 54 are earned. If one trophy is holding you back, its stage above says where it belongs.' }
  ];

  function renderSevenStageRoadmap() {
    var host = document.getElementById('roadmap');
    host.innerHTML = '';
    SEVEN_STAGE_ROADMAP.forEach(function (stage) {
      var members = trophies.filter(function (t) { return t.stage === stage.n; });
      var li = document.createElement('li');
      var links = members.map(function (t) {
        return '<li><a href="#/trophy/' + t.id + '">' + escapeHtml(t.name) + '</a> — ' + gradeLabel(t.grade) +
          (t.missable ? ' · <span class="warn">missable</span>' : '') +
          (earned[t.id] ? ' · earned' : '') + '</li>';
      }).join('');
      li.innerHTML = '<h3>Stage ' + stage.n + ' — ' + escapeHtml(stage.title) + ' (' + members.length + ' trophies)</h3>' +
        '<p>' + escapeHtml(stage.text) + '</p><ul>' + links + '</ul>';
      host.appendChild(li);
    });
  }

  function renderMissableWatchList() {
    var host = document.getElementById('missable-list');
    host.innerHTML = '';
    trophies.filter(function (t) { return t.missable; }).forEach(function (t) {
      host.appendChild(renderTrophyCard(t));
    });
  }

  function renderCitedGuideDetail(id) {
    var trophy = null;
    trophies.forEach(function (t) { if (t.id === id) trophy = t; });
    var host = document.getElementById('detail');
    if (!trophy) {
      host.innerHTML = '<h2>Trophy not found</h2><p>There is no trophy with that number. Back to the <a href="#/">checklist</a>.</p>';
      return;
    }
    var steps = trophy.steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('');
    var sources = '<li><a href="https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/">Exophase — GTA VI trophy list</a> — official name, description and grade. Checked ' + SOURCES_CHECKED_ON + '.</li>' +
      '<li><a href="https://psnprofiles.com/trophies/43531-grand-theft-auto-vi">PSNProfiles — GTA VI trophies</a> — grade and the count PlayStation tracks' + (trophy.count != null ? ' (' + trophy.count + ' ' + escapeHtml(trophy.count_label || '') + ')' : '') + '. Checked ' + SOURCES_CHECKED_ON + '.</li>' +
      '<li>Guide notes — written for this entry from the official description, not copied from any other guide.</li>';
    host.innerHTML =
      '<h2>' + escapeHtml(trophy.name) + '</h2>' +
      '<div class="trophy-meta"><span class="tag grade-' + trophy.grade + '">' + gradeLabel(trophy.grade) + '</span>' +
      '<span class="tag">' + kindLabel(trophy.kind) + '</span>' +
      (trophy.missable ? '<span class="tag missable">Missable</span>' : '') +
      '<span class="tag">' + pointsForTrophy(trophy) + ' points</span>' +
      (trophy.count != null ? '<span class="tag">PSN count: ' + trophy.count + ' ' + escapeHtml(trophy.count_label || '') + '</span>' : '') + '</div>' +
      '<div class="official"><p><strong>Official description (PlayStation):</strong> ' + escapeHtml(trophy.description) + '</p></div>' +
      (trophy.missable && trophy.missable_reason ? '<p class="warn">Missable — ' + escapeHtml(trophy.missable_reason) + '</p>' : '') +
      '<h3>Guide</h3><p>' + escapeHtml(trophy.guide) + '</p>' +
      '<h3>Steps</h3><ol class="steps">' + steps + '</ol>' +
      '<div class="sources-box"><h3>Sources — checked ' + SOURCES_CHECKED_ON + '</h3><ul>' + sources + '</ul>' +
      '<p>Guide written for this entry from the official description; names, descriptions and grades as PlayStation publishes them.</p></div>' +
      '<p><button type="button" id="detail-toggle">' + (earned[trophy.id] ? 'Mark as not earned' : 'Mark as earned') + '</button></p>';
    document.getElementById('detail-toggle').addEventListener('click', function () {
      if (earned[trophy.id]) { delete earned[trophy.id]; } else { earned[trophy.id] = true; }
      saveEarnedChecklist();
      renderAllChecklistViews();
      renderCitedGuideDetail(id);
    });
  }

  function showGuideView(name) {
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

  function routeGuideView() {
    var hash = window.location.hash || '#/';
    var match = hash.match(/^#\/trophy\/(\d+)$/);
    if (match) { showGuideView('detail'); renderCitedGuideDetail(parseInt(match[1], 10)); return; }
    if (hash === '#/roadmap') { showGuideView('roadmap'); renderSevenStageRoadmap(); return; }
    if (hash === '#/missable') { showGuideView('missable'); renderMissableWatchList(); return; }
    if (hash === '#/sources') { showGuideView('sources'); return; }
    showGuideView('checklist');
    renderSpoilerSafeChecklist();
  }

  function renderAllChecklistViews() {
    renderProgressBar();
    renderSpoilerSafeChecklist();
  }

  function exportChecklistProgress() {
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

  function importChecklistProgress(file) {
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
        saveEarnedChecklist();
        renderAllChecklistViews();
        routeGuideView();
      } catch (err) {
        alert('That file could not be imported. Export a progress file from this guide and try that one.');
      }
    };
    reader.readAsText(file);
  }

  function bindGuideControls() {
    document.getElementById('search').addEventListener('input', function (e) {
      query = e.target.value;
      renderSpoilerSafeChecklist();
    });
    document.querySelectorAll('.kind-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.kind-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        kindFilter = btn.getAttribute('data-kind');
        renderSpoilerSafeChecklist();
      });
    });
    document.getElementById('grade-filter').addEventListener('change', function (e) {
      gradeFilter = e.target.value;
      renderSpoilerSafeChecklist();
    });
    document.getElementById('sort').addEventListener('change', renderSpoilerSafeChecklist);
    spoilerToggle.checked = spoilerOn;
    spoilerNote.hidden = !spoilerOn;
    spoilerToggle.addEventListener('change', function () {
      spoilerOn = spoilerToggle.checked;
      saveSpoilerSetting();
      spoilerNote.hidden = !spoilerOn;
      renderAllChecklistViews();
      routeGuideView();
    });
    document.getElementById('export-btn').addEventListener('click', exportChecklistProgress);
    document.getElementById('import-btn').addEventListener('click', function () {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) importChecklistProgress(e.target.files[0]);
      e.target.value = '';
    });
    document.getElementById('reset-btn').addEventListener('click', function () {
      if (window.confirm('Clear all earned trophies and start over?')) {
        earned = {};
        saveEarnedChecklist();
        renderAllChecklistViews();
        routeGuideView();
      }
    });
    window.addEventListener('hashchange', routeGuideView);
  }

  fetch(DATA_URL)
    .then(function (resp) {
      if (!resp.ok) throw new Error('trophy data failed to load');
      return resp.json();
    })
    .then(function (data) {
      trophies = Array.isArray(data) ? data : data.trophies;
      trophies.sort(function (a, b) { return a.id - b.id; });
      renderFeaturedCitedGuide();
      bindGuideControls();
      renderAllChecklistViews();
      routeGuideView();
    })
    .catch(function () {
      listEl.innerHTML = '<li class="trophy-card"><div><h3 class="trophy-name">The trophy data did not load</h3>' +
        '<p class="trophy-desc">app/data/trophies.json could not be read. Check the file is present beside this page and reload.</p></div></li>';
    });
})();
