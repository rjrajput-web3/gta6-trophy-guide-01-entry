// Leonida Trophy Atlas — boot, saved progress, export/import, tabs and hash routing.
// State lives in localStorage under STORAGE_KEY so progress survives a reload.
import { renderChecklist } from './checklist.js';
import { renderTrophyDetail } from './detail.js';
import { renderRoadmap, renderCompletionTable } from './roadmap.js';

export const STORAGE_KEY = 'leonida-trophy-atlas-v1';

export const state = {
  trophies: [],
  roadmap: null,
  sources: {},
  earned: new Set(),
  spoiler: true,
  kind: 'all',
  grade: 'all',
  earnedFilter: 'all',
  search: '',
  view: 'checklist',
  selectedId: null,
};

function loadEarned() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (Array.isArray(saved)) state.earned = new Set(saved.filter((n) => Number.isInteger(n)));
  } catch {
    state.earned = new Set();
  }
}

export function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.earned].sort((a, b) => a - b)));
}

export function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveEarned();
  renderAll();
}

export function earnedCount() {
  return state.earned.size;
}

function renderProgress() {
  const total = state.trophies.length;
  const done = earnedCount();
  document.getElementById('earned-count').textContent = `${done} / ${total}`;
  document.getElementById('earned-percent').textContent =
    total === 0 ? '0% to the Platinum' : `${Math.round((done / total) * 100)}% to the Platinum`;
  document.getElementById('progress-fill').style.width = total === 0 ? '0%' : `${(done / total) * 100}%`;
  const byGrade = {};
  for (const t of state.trophies) {
    if (state.earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  }
  const totals = {};
  for (const t of state.trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  document.getElementById('progress-grades').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${byGrade[g] ?? 0}/${totals[g] ?? 0} ${g}`)
    .join(' · ');
}

export function renderAll() {
  renderProgress();
  if (state.view === 'checklist') {
    renderChecklist(state);
    renderTrophyDetail(state);
  }
}

function setView(view) {
  state.view = view;
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
  document.getElementById('view-checklist').hidden = view !== 'checklist';
  document.getElementById('view-roadmap').hidden = view !== 'roadmap';
  document.getElementById('view-completion').hidden = view !== 'completion';
  if (view === 'roadmap') renderRoadmap(state);
  if (view === 'completion') renderCompletionTable(state);
  if (view === 'checklist') renderAll();
  if (location.hash !== `#/${view}` && state.selectedId === null) {
    history.replaceState(null, '', `#/${view}`);
  }
}

function readHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const params = new URLSearchParams(query ?? '');
  const view = ['checklist', 'roadmap', 'completion'].includes(path) ? path : 'checklist';
  state.view = view;
  if (params.get('kind')) state.kind = params.get('kind');
  if (params.get('grade')) state.grade = params.get('grade');
  if (params.get('spoiler') === 'off') state.spoiler = false;
  if (params.get('spoiler') === 'on') state.spoiler = true;
  const trophy = Number.parseInt(params.get('trophy') ?? '', 10);
  if (Number.isInteger(trophy)) state.selectedId = trophy;
  if (params.get('earned')) {
    const demo = params.get('earned').split(',').map(Number).filter(Number.isInteger);
    if (demo.length > 0 && state.earned.size === 0) {
      state.earned = new Set(demo);
      saveEarned();
    }
  }
}

function bindControls() {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => setView(tab.dataset.view));
  }
  for (const button of document.querySelectorAll('.kind')) {
    button.addEventListener('click', () => {
      state.kind = button.dataset.kind;
      for (const other of document.querySelectorAll('.kind')) {
        other.classList.toggle('active', other === button);
      }
      renderAll();
    });
  }
  document.getElementById('grade').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderAll();
  });
  document.getElementById('earned-filter').addEventListener('change', (event) => {
    state.earnedFilter = event.target.value;
    renderAll();
  });
  document.getElementById('search').addEventListener('input', (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderAll();
  });
  document.getElementById('spoiler').addEventListener('change', (event) => {
    state.spoiler = event.target.checked;
    renderAll();
  });
  document.getElementById('export').addEventListener('click', exportProgress);
  document.getElementById('import').addEventListener('change', importProgress);
  window.addEventListener('hashchange', () => {
    readHash();
    syncControls();
    setView(state.view);
  });
}

function syncControls() {
  document.getElementById('spoiler').checked = state.spoiler;
  document.getElementById('grade').value = state.grade;
  for (const button of document.querySelectorAll('.kind')) {
    button.classList.toggle('active', button.dataset.kind === state.kind);
  }
}

function exportProgress() {
  const payload = {
    guide: 'Leonida Trophy Atlas — GTA VI',
    exported_at: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

async function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('bad file');
    const valid = new Set(state.trophies.map((t) => t.id));
    state.earned = new Set(ids.filter((n) => Number.isInteger(n) && valid.has(n)));
    saveEarned();
    renderAll();
  } catch {
    alert('That file is not a Leonida Trophy Atlas progress export.');
  }
  event.target.value = '';
}

async function bootAtlas() {
  loadEarned();
  const [trophiesDoc, roadmapDoc] = await Promise.all([
    (await fetch('data/trophies.json')).json(),
    (await fetch('data/roadmap.json')).json(),
  ]);
  state.trophies = trophiesDoc.trophies;
  state.sources = trophiesDoc.sources ?? {};
  state.roadmap = roadmapDoc;
  readHash();
  syncControls();
  bindControls();
  setView(state.view);
  if (state.selectedId !== null) renderTrophyDetail(state);
}

bootAtlas();
