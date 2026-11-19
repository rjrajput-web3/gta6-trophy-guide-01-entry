// Vice City Trophy Atlas: offline GTA 6 trophy guide and tracker.
// Loads app/data/trophies.json, renders the checklist, detail pane, roadmap,
// missable list and sources view, and saves progress in localStorage.
const SAVE_KEY = 'vice-city-trophy-atlas-v1';
const SPOILER_KEY = 'vice-city-trophy-atlas-spoilers';
const POINTS = { platinum: 180, gold: 90, silver: 30, bronze: 15 };
const TOTAL_POINTS = 1230;

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPane');
const emptyNote = document.getElementById('emptyNote');
const onlineNote = document.getElementById('onlineNote');
const filterHint = document.getElementById('filterHint');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('gradeFilter');
const sortSelect = document.getElementById('sortOrder');
const spoilerToggle = document.getElementById('spoilerToggle');
const earnedOnlyBox = document.getElementById('earnedOnly');

let trophies = [];
let sourceBook = {};
let earned = new Set();
let selectedId = null;
let kindFilter = 'all';

try {
  earned = new Set(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
} catch (err) {
  earned = new Set();
}
spoilerToggle.checked = localStorage.getItem(SPOILER_KEY) === '1';

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function pointsOf(t) {
  return POINTS[t.grade] || 0;
}

function earnedPoints() {
  return trophies.reduce((sum, t) => (earned.has(t.id) ? sum + pointsOf(t) : sum), 0);
}

function isStoryHidden(t) {
  return spoilerToggle.checked && t.kind === 'story' && !earned.has(t.id);
}

function gradeBadge(t) {
  const span = document.createElement('span');
  span.className = 'grade grade-' + t.grade;
  span.textContent = t.grade;
  return span;
}

function kindTag(t) {
  const span = document.createElement('span');
  span.className = 'tag';
  span.textContent = t.kind === 'story' ? 'Story' : t.kind === 'collectibles' ? 'Collectibles' : t.kind === 'activities' ? 'Activities' : t.kind;
  return span;
}

function renderProgress() {
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const pct = trophies.length ? Math.round((done / trophies.length) * 100) : 0;
  document.getElementById('earnedCount').textContent = done;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('pointsLine').textContent = earnedPoints() + ' of ' + TOTAL_POINTS + ' trophy points';
  document.getElementById('percentLine').textContent = pct + '% to platinum';
  document.getElementById('missableCount').textContent = trophies.filter((t) => t.missable).length;
}

function trophyMatches(t) {
  const q = searchInput.value.trim().toLowerCase();
  if (q) {
    const hay = [t.name, t.description, t.guide, (t.steps || []).join(' ')].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'online') return false;
  if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
  if (gradeSelect.value !== 'all' && t.grade !== gradeSelect.value) return false;
  if (earnedOnlyBox.checked && !earned.has(t.id)) return false;
  return true;
}

function sortTrophies(list) {
  const gradeRank = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  const mode = sortSelect.value;
  const copy = [...list];
  if (mode === 'name') copy.sort((a, b) => a.name.localeCompare(b.name));
  else if (mode === 'grade') copy.sort((a, b) => gradeRank[a.grade] - gradeRank[b.grade] || a.id - b.id);
  else if (mode === 'unearned') copy.sort((a, b) => (earned.has(a.id) - earned.has(b.id)) || a.id - b.id);
  else copy.sort((a, b) => a.id - b.id);
  return copy;
}

function buildTrophyRow(t) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
  li.dataset.trophyId = t.id;
  const top = document.createElement('div');
  top.className = 'trophy-top';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveProgress();
    renderAll();
  });
  const text = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = isStoryHidden(t) ? 'Hidden story trophy — earn it to reveal its name' : t.name;
  const desc = document.createElement('div');
  desc.className = 'trophy-desc' + (isStoryHidden(t) ? ' spoiled' : '');
  desc.textContent = isStoryHidden(t) ? 'Spoiler-safe mode is hiding this story trophy until you earn it.' : t.description;
  text.append(name, desc);
  top.append(box, text);
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.append(gradeBadge(t), kindTag(t));
  if (t.missable) {
    const flag = document.createElement('span');
    flag.className = 'tag tag-missable';
    flag.textContent = 'Missable';
    meta.append(flag);
  }
  if (t.target) {
    const target = document.createElement('span');
    target.className = 'tag tag-target';
    target.textContent = 'Target: ' + t.target.toLocaleString('en-US') + ' ' + t.targetLabel;
    meta.append(target);
  }
  li.append(top, meta);
  li.addEventListener('click', () => selectTrophy(t.id));
  return li;
}

function renderList() {
  const shown = sortTrophies(trophies.filter(trophyMatches));
  listEl.replaceChildren(...shown.map(buildTrophyRow));
  emptyNote.hidden = shown.length > 0;
  onlineNote.hidden = kindFilter !== 'online';
  const done = trophies.filter((t) => earned.has(t.id)).length;
  filterHint.textContent = 'Showing ' + shown.length + ' of 55 trophies · ' + done + ' earned. Spoiler-safe mode hides the names and descriptions of story trophies you have not earned yet.';
}

function sourceLine(key) {
  const entry = sourceBook[key];
  if (!entry) return key;
  const wrap = document.createElement('span');
  wrap.className = 'source-link';
  if (entry.url) {
    const link = document.createElement('a');
    link.href = entry.url;
    link.textContent = entry.name;
    link.rel = 'noopener';
    wrap.append(link, document.createTextNode(' — ' + entry.covers));
  } else {
    wrap.textContent = entry.name + ' — ' + entry.covers;
  }
  return wrap;
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
  const row = listEl.querySelector('[data-trophy-id="' + id + '"]');
  if (row) row.scrollIntoView({ block: 'nearest' });
}

function renderDetail() {
  const t = trophies.find((item) => item.id === selectedId);
  detailEl.replaceChildren();
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Select a trophy to read its guide, steps and sources.';
    detailEl.append(p);
    return;
  }
  const title = document.createElement('h3');
  title.textContent = isStoryHidden(t) ? 'Hidden story trophy' : t.name;
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.append(gradeBadge(t), kindTag(t));
  if (t.missable) {
    const flag = document.createElement('span');
    flag.className = 'tag tag-missable';
    flag.textContent = 'Missable — set it up before the moment passes';
    meta.append(flag);
  }
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = isStoryHidden(t) ? 'Spoiler-safe mode is hiding this story trophy until you earn it.' : 'Official description: ' + t.description;
  const guideHead = document.createElement('h4');
  guideHead.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = t.guide;
  detailEl.append(title, meta, desc, guideHead, guide);
  if (t.target) {
    const targetHead = document.createElement('h4');
    targetHead.textContent = 'Target';
    const targetLine = document.createElement('p');
    targetLine.className = 'detail-guide';
    targetLine.textContent = 'PSN tracks this one toward ' + t.target.toLocaleString('en-US') + ' ' + t.targetLabel + '.';
    detailEl.append(targetHead, targetLine);
  }
  if (t.steps && t.steps.length) {
    const stepsHead = document.createElement('h4');
    stepsHead.textContent = 'Steps';
    const steps = document.createElement('ol');
    for (const step of t.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      steps.append(li);
    }
    detailEl.append(stepsHead, steps);
  }
  const srcHead = document.createElement('h4');
  srcHead.textContent = 'Sources';
  detailEl.append(srcHead);
  for (const key of t.sources || ['exophase', 'psnprofiles', 'atlas']) {
    detailEl.append(sourceLine(key));
  }
  const note = document.createElement('p');
  note.className = 'source-note';
  note.textContent = 'Guide written in our own words for this atlas. The official name and description are shown as PlayStation publishes them.';
  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.textContent = earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned';
  toggleBtn.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    saveProgress();
    renderAll();
  });
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.textContent = 'Previous trophy';
  prevBtn.addEventListener('click', () => {
    const idx = trophies.findIndex((item) => item.id === selectedId);
    if (idx > 0) selectTrophy(trophies[idx - 1].id);
  });
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.textContent = 'Next trophy';
  nextBtn.addEventListener('click', () => {
    const idx = trophies.findIndex((item) => item.id === selectedId);
    if (idx >= 0 && idx < trophies.length - 1) selectTrophy(trophies[idx + 1].id);
  });
  actions.append(toggleBtn, prevBtn, nextBtn);
  detailEl.append(note, actions);
}

const ROADMAP_STAGES = [
  { title: 'Play the story, chapters 1 to 4', body: 'Work the story missions in order and take the named-mission trophies as they come. No grinding yet: just the story, and the checklist fills itself.', ids: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27] },
  { title: 'Clear the missables before the finale', body: 'Ten trophies need a set-up or a single attempt. Earn them as their moments come up, and finish any open ones before the final mission.', ids: [7, 33, 34, 36, 37, 39, 45, 48, 49, 51] },
  { title: 'Strangers, activities and the open world', body: 'Finish the stranger strands, sample all 9 activity types, and try the races, the range and the side jobs. This stage is where the silver for strangers and the shooting range starts.', ids: [15, 16, 17, 18, 19, 20, 21, 25, 29, 32, 38, 41, 43, 44, 46, 47, 50, 55] },
  { title: 'Sweep the collectibles', body: 'Region by region: meditation spots, card sets, WAiNK locations, vehicles, areas of Leonida and the garages. Collectibles are fastest once the whole map is open.', ids: [28, 30, 31, 35, 42, 54] },
  { title: 'The long grinds and the platinum', body: 'Stunts, vaults, laundering, spending and the 100% completion gold. When the last trophy in this stage pops, the platinum follows it.', ids: [1, 14, 40, 52, 53] },
];

function renderRoadmap() {
  const box = document.getElementById('roadmapList');
  box.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const done = stage.ids.filter((id) => earned.has(id)).length;
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.body;
    const count = document.createElement('span');
    count.className = 'stage-count';
    count.textContent = done + ' of ' + stage.ids.length + ' trophies in this stage earned';
    const names = document.createElement('p');
    names.textContent = stage.ids.map((id) => {
      const t = trophies.find((item) => item.id === id);
      return t ? t.name : '';
    }).filter(Boolean).join(' · ');
    li.append(h, p, count, names);
    box.append(li);
  }
}

function renderMissable() {
  const box = document.getElementById('missableList');
  box.replaceChildren(...trophies.filter((t) => t.missable).map(buildTrophyRow));
}

function renderSources() {
  const box = document.getElementById('sourceList');
  box.replaceChildren();
  for (const key of Object.keys(sourceBook)) {
    const entry = sourceBook[key];
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = entry.name;
    const span = document.createElement('span');
    span.textContent = entry.covers + '.';
    li.append(strong, document.createElement('br'), span);
    if (entry.url) {
      const link = document.createElement('a');
      link.href = entry.url;
      link.textContent = entry.url;
      link.rel = 'noopener';
      li.append(document.createElement('br'), link);
    }
    box.append(li);
  }
}

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('trophy/')) return { view: 'checklist', trophy: Number(hash.slice(7)) };
  if (hash === 'roadmap') return { view: 'roadmap' };
  if (hash === 'missable') return { view: 'missable' };
  if (hash === 'sources') return { view: 'sources' };
  return { view: 'checklist' };
}

function renderRoute() {
  const route = currentRoute();
  for (const view of document.querySelectorAll('.view')) view.hidden = true;
  const map = { checklist: 'view-checklist', roadmap: 'view-roadmap', missable: 'view-missable', sources: 'view-sources' };
  document.getElementById(map[route.view]).hidden = false;
  for (const link of document.querySelectorAll('.tabs a')) {
    link.classList.toggle('active', link.dataset.route === (route.view === 'checklist' ? '' : route.view));
  }
  if (route.view === 'roadmap') renderRoadmap();
  if (route.view === 'missable') renderMissable();
  if (route.view === 'sources') renderSources();
  if (route.trophy) {
    selectedId = route.trophy;
    renderList();
    renderDetail();
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  if (currentRoute().view === 'roadmap') renderRoadmap();
  if (currentRoute().view === 'missable') renderMissable();
}

document.getElementById('kindChips').addEventListener('click', (event) => {
  const chip = event.target.closest('[data-kind]');
  if (!chip) return;
  kindFilter = chip.dataset.kind;
  for (const c of document.querySelectorAll('#kindChips .chip')) c.classList.toggle('active', c === chip);
  renderList();
});
searchInput.addEventListener('input', renderList);
gradeSelect.addEventListener('change', renderList);
sortSelect.addEventListener('change', renderList);
earnedOnlyBox.addEventListener('change', renderList);
spoilerToggle.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, spoilerToggle.checked ? '1' : '0');
  renderAll();
});
window.addEventListener('hashchange', renderRoute);

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  link.download = 'vice-city-trophy-atlas-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
});
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set((ids || []).filter((id) => valid.has(Number(id))).map(Number));
    saveProgress();
    renderAll();
    document.getElementById('savedNote').textContent = 'Progress imported: ' + earned.size + ' trophies earned.';
  } catch (err) {
    document.getElementById('savedNote').textContent = 'That file could not be imported. Export a progress file from this guide and try again.';
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Reset all progress? This clears every earned trophy in this browser.')) return;
  earned = new Set();
  saveProgress();
  renderAll();
  document.getElementById('savedNote').textContent = 'Progress reset.';
});

const data = await (await fetch('data/trophies.json')).json();
trophies = data.trophies;
sourceBook = data.sources || {};
renderAll();
renderRoute();
