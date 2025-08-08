// @ts-check

/**
 * @typedef {import('./sqlflow.types').SQLFlowGraph} SQLFlowGraph
 * @typedef {import('./sqlflow.types').SQLFlowEdge} SQLFlowEdge
 * @typedef {import('./sqlflow.types').SQLFlowTable} SQLFlowTable
 */

const state = {
  container: /** @type {HTMLElement|null} */(null),
  options: { minimap: false, zoomControls: false, theme: 'light' },
  svg: /** @type {SVGSVGElement|null} */(null),
  viewport: /** @type {SVGGElement|null} */(null),
  columns: /** @type {Record<string,{x:number,y:number}>} */({}),
  edges: /** @type {Array<{id:string,control?:{x:number,y:number}}>} */([]),
  transform: { x: 0, y: 0, k: 1 }
};

/** Initialize the widget inside a container. */
export function init(container, options = {}) {
  state.container = container;
  state.options = { ...state.options, ...options };
  container.classList.add('kawitan-sqlflow');
  container.classList.toggle('kawitan-sqlflow--dark', state.options.theme === 'dark');

  container.innerHTML = '';
  state.svg = createSVG('svg');
  state.viewport = createSVG('g');
  state.svg.appendChild(state.viewport);
  container.appendChild(state.svg);

  setupPanZoom();
  if (state.options.zoomControls) createZoomControls();
}

/** Render an ER graph. */
export function renderER(graphJson) {
  if (!state.viewport) return;
  state.viewport.innerHTML = '';
  state.columns = {};
  state.edges = [];

  const tables = (graphJson.elements && graphJson.elements.tables) || [];
  const edges = (graphJson.elements && graphJson.elements.edges) || [];

  layoutTables(tables);
  renderTables(tables);
  renderEdges(edges);
  applyTransform();
}

export function zoomIn() {
  setZoom(state.transform.k * 1.2);
}

export function zoomOut() {
  setZoom(state.transform.k / 1.2);
}

export function resetView() {
  state.transform = { x: 0, y: 0, k: 1 };
  applyTransform();
}

// Helpers -------------------------------------------------------
function renderTables(/** @type {SQLFlowTable[]} */tables) {
  if (!state.viewport) return;
  const headerHeight = 20;
  const rowHeight = 18;
  const width = 180;

  tables.forEach((t) => {
    const cols = t.columns || [];
    const height = headerHeight + cols.length * rowHeight;
    const g = createSVG('g');
    g.setAttribute('class', 'table');
    g.setAttribute('transform', `translate(${t.x},${t.y})`);

    const rect = createSVG('rect');
    rect.setAttribute('width', String(width));
    rect.setAttribute('height', String(height));
    g.appendChild(rect);

    const title = createSVG('text');
    title.setAttribute('x', '5');
    title.setAttribute('y', '15');
    title.textContent = t.label && typeof t.label === 'object' ? t.label.content : String(t.label);
    g.appendChild(title);

    cols.forEach((c, idx) => {
      const y = headerHeight + idx * rowHeight + rowHeight - 4;
      const text = createSVG('text');
      text.setAttribute('x', '10');
      text.setAttribute('y', String(y));
      text.textContent = c.label && typeof c.label === 'object' ? c.label.content : String(c.label);
      g.appendChild(text);

      const cy = headerHeight + idx * rowHeight + rowHeight / 2;
      state.columns[c.id] = { x: t.x + width / 2, y: t.y + cy };
    });

    state.viewport.appendChild(g);
  });
}

function renderEdges(/** @type {SQLFlowEdge[]} */edges) {
  if (!state.viewport) return;

  edges.forEach((e) => {
    const s = state.columns[e.sourceId];
    const t = state.columns[e.targetId];
    if (!s || !t) return;

    const edge = { id: e.id, control: e.control || { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 } };
    const g = createSVG('g');
    g.setAttribute('class', 'edge');

    const path = createSVG('path');
    path.setAttribute('d', edgePath(s, t, edge.control));
    g.appendChild(path);

    if (e.label) {
      const lbl = createSVG('text');
      lbl.textContent = e.label;
      lbl.setAttribute('x', String(edge.control.x));
      lbl.setAttribute('y', String(edge.control.y - 4));
      g.appendChild(lbl);
    }

    const ctrl = createSVG('circle');
    ctrl.setAttribute('class', 'control');
    ctrl.setAttribute('r', '4');
    ctrl.setAttribute('cx', String(edge.control.x));
    ctrl.setAttribute('cy', String(edge.control.y));
    makeDraggable(ctrl, edge, path, s, t);
    g.appendChild(ctrl);

    state.viewport.appendChild(g);
    state.edges.push(edge);
  });
}

function layoutTables(/** @type {SQLFlowTable[]} */tables) {
  const cols = Math.ceil(Math.sqrt(tables.length || 1));
  const spacingX = 220;
  const spacingY = 180;
  tables.forEach((t, i) => {
    if (typeof t.x !== 'number') t.x = (i % cols) * spacingX;
    if (typeof t.y !== 'number') t.y = Math.floor(i / cols) * spacingY;
  });
}

function edgePath(s, t, c) {
  return `M${s.x},${s.y} Q${c.x},${c.y} ${t.x},${t.y}`;
}

function createSVG(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function makeDraggable(ctrl, edge, path, s, t) {
  ctrl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (!state.svg) return;
    state.svg.setPointerCapture(e.pointerId);

    const move = (ev) => {
      const pt = toSvgPoint(ev);
      edge.control = { x: pt.x, y: pt.y };
      ctrl.setAttribute('cx', String(pt.x));
      ctrl.setAttribute('cy', String(pt.y));
      path.setAttribute('d', edgePath(s, t, edge.control));
    };
    const up = (ev) => {
      if (!state.svg) return;
      state.svg.releasePointerCapture(e.pointerId);
      state.svg.removeEventListener('pointermove', move);
      state.svg.removeEventListener('pointerup', up);
    };
    state.svg.addEventListener('pointermove', move);
    state.svg.addEventListener('pointerup', up);
  });
}

function toSvgPoint(evt) {
  const pt = state.svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(state.svg.getScreenCTM().inverse());
}

function setupPanZoom() {
  if (!state.svg || !state.viewport) return;
  let panning = false;
  let last = { x: 0, y: 0 };

  state.svg.addEventListener('pointerdown', (e) => {
    if (e.target !== state.svg) return;
    panning = true;
    last = { x: e.clientX, y: e.clientY };
    state.svg.setPointerCapture(e.pointerId);
  });

  state.svg.addEventListener('pointermove', (e) => {
    if (!panning) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY };
    state.transform.x += dx;
    state.transform.y += dy;
    applyTransform();
  });

  state.svg.addEventListener('pointerup', (e) => {
    panning = false;
    state.svg.releasePointerCapture(e.pointerId);
  });

  state.svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(state.transform.k * scale);
  });
}

function createZoomControls() {
  if (!state.container) return;
  const controls = document.createElement('div');
  controls.className = 'zoom-controls';
  const zin = document.createElement('button');
  zin.textContent = '+';
  zin.addEventListener('click', () => zoomIn());
  const zout = document.createElement('button');
  zout.textContent = '-';
  zout.addEventListener('click', () => zoomOut());
  const reset = document.createElement('button');
  reset.textContent = 'reset';
  reset.addEventListener('click', () => resetView());
  controls.append(zin, zout, reset);
  state.container.appendChild(controls);
}

function setZoom(k) {
  state.transform.k = Math.max(0.25, Math.min(4, k));
  applyTransform();
}

function applyTransform() {
  if (!state.viewport) return;
  const { x, y, k } = state.transform;
  state.viewport.setAttribute('transform', `translate(${x},${y}) scale(${k})`);
}
