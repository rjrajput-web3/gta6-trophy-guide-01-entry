// Checklist rendering: filters, search, spoiler masking and the earned tick.
// A hidden story trophy stays masked while the spoiler setting is on and it is
// not earned yet: only its grade shows, never its name or description.
import { toggleEarned } from './app.js';
import { renderTrophyDetail } from './detail.js';

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export function isSpoilerMasked(trophy, state) {
  return state.spoiler && trophy.hidden && !state.earned.has(trophy.id);
}

function trophyMatches(trophy, state) {
  if (state.kind === 'online') return false;
  if (state.kind !== 'all' && !trophy.kinds.includes(state.kind)) return false;
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.earnedFilter === 'earned' && !state.earned.has(trophy.id)) return false;
  if (state.earnedFilter === 'missing' && state.earned.has(trophy.id)) return false;
  if (state.search) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(state.search)) return false;
  }
  return true;
}

function gradeBadge(trophy) {
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${trophy.grade}`;
  badge.textContent = trophy.grade;
  return badge;
}

function kindTags(trophy) {
  const wrap = document.createElement('span');
  for (const kind of trophy.kinds) {
    const tag = document.createElement('span');
    tag.className = 'kind-tag';
    tag.textContent = KIND_LABELS[kind] ?? kind;
    wrap.append(tag);
  }
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'missable-flag';
    flag.textContent = '⚠ Missable';
    wrap.append(document.createElement('br'), flag);
  }
  return wrap;
}

function trophyRow(trophy, state) {
  const row = document.createElement('tr');
  if (state.earned.has(trophy.id)) row.classList.add('earned-row');

  const tickCell = document.createElement('td');
  const tick = document.createElement('input');
  tick.type = 'checkbox';
  tick.className = 'tick';
  tick.checked = state.earned.has(trophy.id);
  tick.setAttribute('aria-label', `Mark ${trophy.name} earned`);
  tick.addEventListener('change', () => toggleEarned(trophy.id));
  tickCell.append(tick);
  row.append(tickCell);

  const nameCell = document.createElement('td');
  const masked = isSpoilerMasked(trophy, state);
  if (masked) {
    const name = document.createElement('div');
    name.className = 'trophy-name hidden-note';
    name.textContent = 'Hidden story trophy — earn it to reveal';
    const desc = document.createElement('div');
    desc.className = 'trophy-desc hidden-note';
    desc.textContent = 'Spoilers hidden. Tick it earned, or turn spoilers off.';
    nameCell.append(name, desc);
  } else {
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = trophy.name;
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = trophy.description;
    nameCell.append(name, desc);
    if (trophy.count !== null && trophy.count !== undefined) {
      const count = document.createElement('div');
      count.className = 'trophy-count';
      count.textContent = `Target: ${trophy.count.toLocaleString('en-US')} ${trophy.count_label ?? ''}`.trim();
      nameCell.append(count);
    }
  }
  row.append(nameCell);

  const gradeCell = document.createElement('td');
  gradeCell.append(gradeBadge(trophy));
  if (trophy.hidden) {
    const note = document.createElement('div');
    note.className = 'hidden-note';
    note.textContent = 'Hidden';
    gradeCell.append(note);
  }
  row.append(gradeCell);

  const kindCell = document.createElement('td');
  kindCell.append(kindTags(trophy));
  row.append(kindCell);

  const guideCell = document.createElement('td');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'guide-btn';
  button.textContent = masked ? 'Guide hidden' : 'Read guide';
  button.addEventListener('click', () => {
    state.selectedId = trophy.id;
    renderTrophyDetail(state);
    document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  guideCell.append(button);
  row.append(guideCell);

  return row;
}

export function renderChecklist(state) {
  const rows = document.getElementById('rows');
  rows.replaceChildren();
  const empty = document.getElementById('empty-state');

  if (state.kind === 'online') {
    empty.hidden = false;
    empty.textContent =
      'No online trophies: every one of the 55 is single-player. PlayStation lists the game as a single-player experience, and the launch guides confirm the list has no online trophies.';
    document.getElementById('list-summary').textContent = '0 of 55 shown — the Online filter is empty by design.';
    return;
  }

  const shown = state.trophies.filter((trophy) => trophyMatches(trophy, state));
  for (const trophy of shown) rows.append(trophyRow(trophy, state));

  const earnedShown = shown.filter((trophy) => state.earned.has(trophy.id)).length;
  document.getElementById('list-summary').textContent =
    `Showing ${shown.length} of ${state.trophies.length} trophies` +
    (shown.length > 0 ? ` · ${earnedShown} earned in this view` : '') +
    (state.spoiler ? ' · story spoilers hidden' : ' · story spoilers shown');

  if (shown.length === 0) {
    empty.hidden = false;
    empty.textContent = 'No trophies match these filters. Clear the search or pick another kind or grade.';
  } else {
    empty.hidden = true;
  }
}
