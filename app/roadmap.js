// Roadmap and 100% completion views: phases built from the official trophy
// descriptions, and the trophy target next to the 100% checklist number.
export function renderRoadmap(state) {
  const list = document.getElementById('phases');
  list.replaceChildren();
  if (!state.roadmap) return;
  for (const phase of state.roadmap.phases) {
    const item = document.createElement('li');
    const heading = document.createElement('h3');
    heading.textContent = phase.title;
    const time = document.createElement('span');
    time.className = 'phase-time';
    time.textContent = phase.time;
    const points = document.createElement('ul');
    for (const point of phase.points) {
      const line = document.createElement('li');
      line.textContent = point;
      points.append(line);
    }
    item.append(heading, time, points);
    list.append(item);
  }
}

export function renderCompletionTable(state) {
  const body = document.getElementById('completion-rows');
  body.replaceChildren();
  if (!state.roadmap) return;
  for (const row of state.roadmap.completion) {
    const line = document.createElement('tr');
    const item = document.createElement('td');
    item.textContent = row.item;
    const trophy = document.createElement('td');
    trophy.textContent = String(row.trophy);
    const hundred = document.createElement('td');
    hundred.textContent = String(row.hundred);
    line.append(item, trophy, hundred);
    body.append(line);
  }
}
