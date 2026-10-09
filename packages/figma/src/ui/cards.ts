import type { BindingRow } from '../bindings/rows';
import { ROLE_LABELS, type Role } from '../roles';
import { element, iconButton, previewStore } from './dom';
import { icon } from './icons';

export interface CardHandlers {
  bind(role: Role): void;
  unbind(role: Role): void;
  editSlots(row: BindingRow): void;
  canBind(): boolean;
}

const GROUPS: Record<string, string> = { field: 'Fields', option: 'Options', button: 'Buttons' };
const DRAG_TYPE = 'application/x-formhaus-selection';
const store = previewStore();

function status(row: BindingRow, kitName: string): { label: string; tone: string } {
  if (row.missing) return { label: 'Missing', tone: 'danger' };
  if (row.via) return { label: 'Shared', tone: 'neutral' };
  if (row.name) return { label: 'Yours', tone: 'brand' };
  return { label: 'Kit', tone: 'neutral' };
}

function preview(row: BindingRow): HTMLElement {
  const frame = element('div', 'card-preview');
  if (row.thumbnail) {
    const image = element('img');
    image.src = store.url(row.thumbnail);
    image.alt = '';
    image.draggable = false;
    frame.appendChild(image);
  } else {
    frame.appendChild(element('span', 'card-empty', row.missing ? 'Component not found' : 'No preview yet'));
  }
  return frame;
}

function subtitle(row: BindingRow, kitName: string): string {
  if (row.missing) return 'Select it again or clear it';
  if (row.via) return `Same as ${ROLE_LABELS[row.via]}`;
  return row.name ?? kitName;
}

function acceptSelection(card: HTMLElement, role: Role, handlers: CardHandlers): void {
  card.addEventListener('dragover', (event) => {
    if (!event.dataTransfer?.types.includes(DRAG_TYPE)) return;
    event.preventDefault();
    card.classList.add('is-target');
  });
  card.addEventListener('dragleave', () => card.classList.remove('is-target'));
  card.addEventListener('drop', (event) => {
    card.classList.remove('is-target');
    if (!event.dataTransfer?.types.includes(DRAG_TYPE)) return;
    event.preventDefault();
    handlers.bind(role);
  });
}

function placeOnCanvas(card: HTMLElement, role: Role): void {
  card.draggable = true;
  card.addEventListener('dragstart', (event) => event.dataTransfer?.setData('text/plain', role));
  card.addEventListener('dragend', (event) => {
    if (event.view && event.view.length === 0) return;
    parent.postMessage({ pluginDrop: { clientX: event.clientX, clientY: event.clientY, items: [], dropMetadata: { role } } }, '*');
  });
}

function card(row: BindingRow, kitName: string, handlers: CardHandlers): HTMLElement {
  const tone = status(row, kitName);
  const node = element('article', `card tone-${tone.tone}`);
  node.dataset.role = row.role;
  const head = element('div', 'card-head');
  head.append(element('div', 'card-title', ROLE_LABELS[row.role]), element('span', `badge tone-${tone.tone}`, tone.label));
  const body = element('div', 'card-body');
  body.append(head, element('div', 'card-sub', subtitle(row, kitName)));
  if (row.staleProperties) {
    const warning = element('div', 'card-warning');
    warning.append(icon('warning', 12), document.createTextNode(`Missing ${row.staleProperties.join(', ')}. Bind again.`));
    body.appendChild(warning);
  }
  const actions = element('div', 'card-actions');
  actions.appendChild(iconButton('link', 'Bind the selected component', () => handlers.bind(row.role), 'icon-btn bind-btn'));
  if (row.candidates?.length) actions.appendChild(iconButton('tune', 'Text slots', () => handlers.editSlots(row)));
  if (row.name && !row.via) actions.appendChild(iconButton('close', 'Clear binding', () => handlers.unbind(row.role)));
  const overlay = element('div', 'card-overlay');
  const pill = element('span', 'overlay-pill');
  pill.append(icon('link'), document.createTextNode('Bind selection'));
  overlay.appendChild(pill);
  node.append(preview(row), body, actions, overlay);
  node.onclick = () => handlers.canBind() && handlers.bind(row.role);
  acceptSelection(node, row.role, handlers);
  placeOnCanvas(node, row.role);
  return node;
}

export function renderCards(container: HTMLElement, rows: BindingRow[], kitName: string, handlers: CardHandlers): void {
  store.release();
  const sections = Object.entries(GROUPS).map(([prefix, title]) => {
    const items = rows.filter((row) => row.role.startsWith(`${prefix}.`));
    const bound = items.filter((row) => row.name && !row.via && !row.missing).length;
    const section = element('section', 'group');
    const header = element('header', 'group-header');
    header.append(element('h3', '', title), element('span', 'group-count', `${bound} of ${items.length} custom`));
    const grid = element('div', 'grid');
    for (const row of items) grid.appendChild(card(row, kitName, handlers));
    section.append(header, grid);
    return section;
  });
  container.replaceChildren(...sections);
}

export { DRAG_TYPE };
