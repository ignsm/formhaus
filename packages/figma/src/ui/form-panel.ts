import type { FormDefinition } from '@formhaus/core';
import { ROLES } from '../roles';
import { byId } from './dom';
import { createEditor } from './editor/editor';
import { emptyForm } from './editor/model';
import { EXAMPLE } from './example';

type Post = (message: Record<string, unknown>) => void;
type Show = (element: HTMLElement, text: string, type?: 'error' | 'success' | 'info') => void;

export interface SourceState {
  source?: string;
  kit?: string;
  boundCount?: number;
}

export function createFormPanel(post: Post, show: Show, openComponents: () => void) {
  const sourceSelect = byId<HTMLSelectElement>('sourceSelect');
  const status = byId('formStatus');
  const jsonInput = byId<HTMLTextAreaElement>('definition');
  const editorRoot = byId('editor');
  const output = byId('output');
  const button = byId<HTMLButtonElement>('generate');
  const modes = [...document.querySelectorAll<HTMLButtonElement>('.mode')];
  let mode: 'fields' | 'json' = 'fields';
  let canvasId: string | null = null;

  const editor = createEditor(editorRoot, refresh);

  function refresh(): void {
    const draft = editor.get();
    const editing = canvasId !== null && draft.id === canvasId;
    status.textContent = editing ? `Editing “${draft.title || 'Untitled'}” from the canvas` : 'New form';
    status.classList.toggle('is-editing', editing);
    button.textContent = editing ? 'Update form' : 'Generate form';
  }

  function load(definition: FormDefinition): void {
    editor.set(definition);
    jsonInput.value = JSON.stringify(definition, null, 2);
    refresh();
  }

  function setMode(next: 'fields' | 'json'): void {
    if (next === mode) return;
    if (next === 'json') jsonInput.value = JSON.stringify(editor.get(), null, 2);
    else {
      try {
        editor.set(JSON.parse(jsonInput.value) as FormDefinition);
      } catch (error) {
        return show(output, `Fix the JSON first: ${error instanceof Error ? error.message : String(error)}`, 'error');
      }
    }
    mode = next;
    show(output, '');
    for (const item of modes) item.classList.toggle('active', item.dataset.mode === mode);
    editorRoot.hidden = mode !== 'fields';
    jsonInput.hidden = mode !== 'json';
    refresh();
  }

  for (const item of modes) item.onclick = () => setMode(item.dataset.mode as 'fields' | 'json');
  sourceSelect.onchange = () => {
    const [source, kit] = sourceSelect.value.split(':');
    post({ type: 'setComponents', source, kit });
  };
  byId('openComponents').onclick = openComponents;
  byId('newForm').onclick = () => load(emptyForm());
  byId('loadExample').onclick = () => load(JSON.parse(EXAMPLE) as FormDefinition);
  button.onclick = () => {
    const definition = mode === 'json' ? jsonInput.value.trim() : JSON.stringify(editor.get());
    if (!definition) return show(output, 'Add some fields first.', 'error');
    button.disabled = true;
    button.textContent = 'Working…';
    show(output, '');
    post({ type: 'generate', definition });
  };

  load(emptyForm());

  return {
    setCanvasForm(definition: FormDefinition | null) {
      if (!definition) return;
      canvasId = definition.id;
      if (editor.get().id !== definition.id) load(definition);
      else refresh();
      if (mode === 'json') jsonInput.value = JSON.stringify(editor.get(), null, 2);
    },
    setSource(state: SourceState) {
      const custom = sourceSelect.querySelector<HTMLOptionElement>('option[value=custom]');
      if (custom) custom.textContent = state.boundCount ? `My components · ${state.boundCount} of ${ROLES.length}` : 'My components';
      sourceSelect.value = state.source === 'custom' ? 'custom' : `kit:${state.kit ?? 'material'}`;
    },
    finish(text: string, type: 'error' | 'success') {
      button.disabled = false;
      refresh();
      show(output, text, type);
    },
  };
}
