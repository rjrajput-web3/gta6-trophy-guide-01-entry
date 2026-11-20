// Platinum Trail — GTA VI trophy tracker.
// Loads app/data/trophies.json, renders the checklist, and saves progress
// in this browser (localStorage) with JSON export / import.
(function () {
  'use strict';

  var STORE_KEY = 'platinum-trail-progress-v1';
  var listEl = document.getElementById('trophy-list');
  var searchEl = document.getElementById('search');
  var gradeEl = document.getElementById('grade-filter');
  var categoryEl = document.getElementById('category-filter');
  var spoilerEl = document.getElementById('spoiler-toggle');
  var hideEarnedEl = document.getElementById('hide-earned');
  var missableEl = document.getElementById('missable-only');
  var metaEl = document.getElementById('list-meta');
  var params = new URLSearchParams(window.location.search);

  var trophies = [];
  var earned = loadProgress();

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) { return {}; }
  }

  function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(earned)); } catch (e) { /* private mode */ }
  }

  function gradeLabel(grade) {
    return grade.charAt(0).toUpperCase() + grade.slice(1);
  }

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function updateProgress() {
    var total = trophies.length;
    var done = trophies.filter(function (t) { return earned[t.id]; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById('progress-label').textContent = done + ' of ' + total + ' earned';
    document.getElementById('progress-pct').textContent = pct + '%';
    document.getElementById('progress-fill').style.width = pct + '%';
    var counts = {};
    trophies.forEach(function (t) {
      counts[t.grade] = counts[t.grade] || { total: 0, done: 0 };
      counts[t.grade].total++;
      if (earned[t.id]) counts[t.grade].done++;
    });
    document.getElementById('grade-counts').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
      .map(function (g) {
        var c = counts[g] || { total: 0, done: 0 };
        return '<span><b>' + gradeLabel(g) + '</b> ' + c.done + '/' + c.total + '</span>';
      }).join('');
  }

  function visibleTrophies() {
    var q = (searchEl.value || '').trim().toLowerCase();
    var grade = gradeEl.value;
    var cat = categoryEl.value;
    return trophies.filter(function (t) {
      if (grade !== 'all' && t.grade !== grade) return false;
      if (cat !== 'all' && t.category !== cat) return false;
      if (missableEl.checked && !t.missable) return false;
      if (hideEarnedEl.checked && earned[t.id]) return false;
      if (spoilerEl.checked && t.hidden && !earned[t.id]) return false;
      if (q && t.name.toLowerCase().indexOf(q) === -1 &&
          t.description.toLowerCase().indexOf(q) === -1 &&
          t.guide.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function render() {
    var shown = visibleTrophies();
    var spoilerHidden = trophies.filter(function (t) { return spoilerEl.checked && t.hidden && !earned[t.id]; }).length;
    metaEl.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies' +
      (spoilerHidden ? ' — ' + spoilerHidden + ' story trophies hidden by the spoiler setting (earn one to reveal it).' : '.');
    if (!shown.length) {
      listEl.innerHTML = '<p class="empty">No trophies match these filters. Clear the search or change a filter.</p>';
      return;
    }
    listEl.innerHTML = shown.map(function (t) {
      var isEarned = !!earned[t.id];
      var tags = '<span class="grade-badge ' + esc(t.grade) + '">' + esc(gradeLabel(t.grade)) + '</span>' +
        '<span class="tag">' + esc(t.category) + '</span>' +
        (t.hidden ? '<span class="tag hidden-tag">Hidden</span>' : '') +
        (t.missable ? '<span class="tag missable">Missable</span>' : '');
      var target = t.target ? '<p class="target-line">Target: ' + esc(String(t.target)) + (t.targetUnit ? ' ' + esc(t.targetUnit) : '') + '</p>' : '';
      var open = params.get('open') === t.id;
      return '<article class="trophy-card' + (isEarned ? ' earned' : '') + '" data-id="' + esc(t.id) + '">' +
        '<div class="card-top">' +
        '<input type="checkbox" class="check" data-id="' + esc(t.id) + '"' + (isEarned ? ' checked' : '') + ' aria-label="Mark ' + esc(t.name) + ' earned">' +
        '<div class="card-main">' +
        '<h3 class="' + (isEarned ? 'earned-name' : '') + '">' + esc(t.name) + '</h3>' +
        '<p class="official">' + esc(t.description) + '</p>' +
        '<div class="badges">' + tags + '</div>' + target +
        '<button type="button" class="guide-toggle" data-id="' + esc(t.id) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' + (open ? 'Hide guide' : 'Show guide') + '</button>' +
        '<p class="guide" data-guide="' + esc(t.id) + '"' + (open ? '' : ' hidden') + '>' + esc(t.guide) + '</p>' +
        '<p class="src">Sources: ' + esc(t.sources.join('; ')) + '</p>' +
        '</div></div></article>';
    }).join('');
    updateProgress();
  }

  function bindEvents() {
    [searchEl, gradeEl, categoryEl, spoilerEl, hideEarnedEl, missableEl].forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    listEl.addEventListener('change', function (ev) {
      var box = ev.target.closest('.check');
      if (!box) return;
      earned[box.getAttribute('data-id')] = box.checked || undefined;
      if (!box.checked) delete earned[box.getAttribute('data-id')];
      saveProgress();
      render();
    });
    listEl.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.guide-toggle');
      if (!btn) return;
      var id = btn.getAttribute('data-id');
      var guide = listEl.querySelector('[data-guide="' + id + '"]');
      var showing = guide.hasAttribute('hidden');
      if (showing) { guide.removeAttribute('hidden'); btn.textContent = 'Hide guide'; btn.setAttribute('aria-expanded', 'true'); }
      else { guide.setAttribute('hidden', ''); btn.textContent = 'Show guide'; btn.setAttribute('aria-expanded', 'false'); }
    });
    document.getElementById('export-btn').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: Object.keys(earned) }, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'platinum-trail-progress.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    document.getElementById('import-btn').addEventListener('click', function () {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', function (ev) {
      var file = ev.target.files && ev.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(String(reader.result));
          var ids = Array.isArray(data.earned) ? data.earned : Object.keys(data);
          earned = {};
          ids.forEach(function (id) { earned[id] = true; });
          saveProgress();
          render();
        } catch (e) { alert('That file is not a valid Platinum Trail progress export.'); }
      };
      reader.readAsText(file);
      ev.target.value = '';
    });
    document.getElementById('reset-btn').addEventListener('click', function () {
      if (!confirm('Clear every earned trophy? This cannot be undone.')) return;
      earned = {};
      saveProgress();
      render();
    });
  }

  function applyParams() {
    if (params.get('grade')) gradeEl.value = params.get('grade');
    if (params.get('category')) categoryEl.value = params.get('category');
    if (params.get('spoiler') === '0') spoilerEl.checked = false;
    if (params.get('hide-earned') === '1') hideEarnedEl.checked = true;
    if (params.get('missable') === '1') missableEl.checked = true;
    if (params.get('q')) searchEl.value = params.get('q');
    // Demo mode for screenshots: pre-check a fixed, deterministic set.
    if (params.get('demo') === '1') {
      ['just-like-paradise', 'paradise-lost', 'tits-ass-drug-money', 'vice-city-baby',
       'master-of-none', 'top-fun', 'whip-it-good', 'treat-yo-self'].forEach(function (id) { earned[id] = true; });
    }
  }

  fetch('data/trophies.json')
    .then(function (r) { if (!r.ok) throw new Error('trophies.json failed: ' + r.status); return r.json(); })
    .then(function (data) {
      trophies = data.trophies;
      var cats = [];
      trophies.forEach(function (t) { if (cats.indexOf(t.category) === -1) cats.push(t.category); });
      cats.forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = c; opt.textContent = c;
        categoryEl.appendChild(opt);
      });
      applyParams();
      bindEvents();
      render();
    })
    .catch(function (err) {
      listEl.innerHTML = '<p class="empty">Could not load the trophy list (' + esc(err.message) + '). Open this guide from its own files with a local server.</p>';
    });
})();
