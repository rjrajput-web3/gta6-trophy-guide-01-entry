// Trophy detail panel: the official description, the guide in our own words,
// its steps, when it can be missed, and the sources each fact comes from.
import { saveEarned, renderAll } from './app.js';
import { isSpoilerMasked } from './checklist.js';

function sourceLink(name, sources) {
  const item = document.createElement('li');
  const url = sources[name];
  if (url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = name;
    item.append(link);
  } else {
    item.textContent = name;
  }
  return item;
}

export function renderTrophyDetail(state) {
  const panel = document.getElementById('detail');
  panel.replaceChildren();

  const trophy = state.trophies.find((candidate) => candidate.id === state.selectedId);
  if (!trophy) {
    const placeholder = document.createElement('p');
    placeholder.className = 'placeholder';
    placeholder.textContent =
      'Pick a trophy in the checklist to read its guide here: what to do, where and how, when it can be missed, and the sources behind each fact.';
    const hint = document.createElement('p');
    hint.className = 'placeholder';
    hint.textContent =
      'Every guide is written for this page in our own words and cites its sources. The five trophies with no confirmed method at launch say so plainly.';
    panel.append(placeholder, hint);
    return;
  }

  const masked = isSpoilerMasked(trophy, state);

  const heading = document.createElement('h2');
  heading.textContent = masked ? 'Hidden story trophy' : trophy.name;
  panel.append(heading);

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = masked
    ? `Grade: ${trophy.grade} · Hidden on PlayStation until earned.`
    : `Official: “${trophy.description}” · Grade: ${trophy.grade}${trophy.hidden ? ' · Hidden on PlayStation until earned' : ''}`;
  panel.append(official);

  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn-box';
    warn.textContent =
      '⚠ Missable — the only trophy on the list that can be missed. Do the Chapter 1 balcony meditation before Chapter 1 ends, and keep a Chapter 1 save until this pops.';
    panel.append(warn);
  }

  if (masked) {
    const note = document.createElement('p');
    note.className = 'placeholder';
    note.textContent =
      'Spoilers are on, so this story trophy stays hidden until you earn it. Tick it earned in the checklist, or turn “Hide story spoilers” off, to read its guide.';
    panel.append(note);
  } else {
    const guideHeading = document.createElement('h3');
    guideHeading.textContent = 'Guide';
    panel.append(guideHeading);
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    panel.append(guide);

    if (trophy.steps && trophy.steps.length > 0) {
      const stepsHeading = document.createElement('h3');
      stepsHeading.textContent = 'Steps';
      panel.append(stepsHeading);
      const steps = document.createElement('ol');
      for (const step of trophy.steps) {
        const item = document.createElement('li');
        item.textContent = step;
        steps.append(item);
      }
      panel.append(steps);
    }

    if (trophy.count !== null && trophy.count !== undefined) {
      const target = document.createElement('p');
      target.textContent = `Target: ${trophy.count.toLocaleString('en-US')} ${trophy.count_label ?? ''}`.trim();
      panel.append(target);
    }

    const sourcesHeading = document.createElement('h3');
    sourcesHeading.textContent = 'Sources';
    panel.append(sourcesHeading);
    const sources = document.createElement('ul');
    sources.className = 'sources';
    for (const name of trophy.sources) sources.append(sourceLink(name, state.sources));
    const listNote = document.createElement('li');
    listNote.textContent = 'PlayStation trophy list via Exophase, reported by Push Square';
    sources.append(listNote);
    panel.append(sources);
  }

  const earnedLine = document.createElement('label');
  earnedLine.className = 'earned-line';
  const tick = document.createElement('input');
  tick.type = 'checkbox';
  tick.className = 'tick';
  tick.checked = state.earned.has(trophy.id);
  tick.addEventListener('change', () => {
    if (tick.checked) state.earned.add(trophy.id);
    else state.earned.delete(trophy.id);
    saveEarned();
    renderAll();
  });
  earnedLine.append(tick, document.createTextNode('Earned'));
  panel.append(earnedLine);
}
