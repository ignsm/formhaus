import type { FormDefinition, FormField } from '@formhaus/core';
import { element, iconButton } from '../dom';
import { icon } from '../icons';
import { fieldRow, typeSelect } from './field-row';
import { addField, addStep, isMultiStep, moveField, removeField, removeStep, steps } from './model';

export interface FormEditor {
  get(): FormDefinition;
  set(draft: FormDefinition): void;
}

type Position = [number, number];

function textInput(value: string, placeholder: string, className: string, onInput: (value: string) => void): HTMLInputElement {
  const node = element('input', className);
  node.value = value;
  node.placeholder = placeholder;
  node.oninput = () => onInput(node.value);
  return node;
}

function labelled(text: string, control: HTMLElement): HTMLElement {
  const node = element('label', 'head-field');
  node.append(element('span', 'section-label', text), control);
  return node;
}

export function createEditor(container: HTMLElement, onChange: () => void): FormEditor {
  let draft: FormDefinition = { id: 'form', title: '', submit: { label: 'Submit' }, fields: [] };
  const open = new WeakSet<FormField>();
  let dragging: Position | null = null;

  function dropTarget(row: HTMLElement, position: Position): void {
    row.addEventListener('dragover', (event) => {
      if (!dragging) return;
      event.preventDefault();
      const after = event.offsetY > row.offsetHeight / 2;
      row.classList.toggle('drop-after', after);
      row.classList.toggle('drop-before', !after);
    });
    row.addEventListener('dragleave', () => row.classList.remove('drop-before', 'drop-after'));
    row.addEventListener('drop', (event) => {
      if (!dragging) return;
      event.preventDefault();
      const after = row.classList.contains('drop-after');
      moveField(draft, dragging, [position[0], position[1] + (after ? 1 : 0)]);
      dragging = null;
      render();
      onChange();
    });
  }

  function draggableRow(row: HTMLElement, position: Position): void {
    const handle = row.querySelector<HTMLElement>('.drag-handle');
    handle?.addEventListener('mousedown', () => { row.draggable = true; });
    handle?.addEventListener('mouseup', () => { row.draggable = false; });
    row.addEventListener('dragstart', () => {
      dragging = position;
      row.classList.add('is-dragging');
    });
    row.addEventListener('dragend', () => {
      row.draggable = false;
      dragging = null;
      render();
    });
    dropTarget(row, position);
  }

  function stepSection(stepIndex: number): HTMLElement {
    const step = steps(draft)[stepIndex];
    const section = element('section', 'step');
    if (isMultiStep(draft)) {
      const header = element('header', 'step-header');
      header.append(
        element('span', 'step-number', String(stepIndex + 1)),
        textInput(step.title, 'Step title', 'input step-title', (value) => { step.title = value; onChange(); }),
        iconButton('delete', 'Delete step', () => { removeStep(draft, stepIndex); render(); onChange(); }),
      );
      section.appendChild(header);
    }
    const list = element('div', 'field-list');
    step.fields.forEach((field, fieldIndex) => {
      const row = fieldRow(field, {
        draft,
        changed: onChange,
        rerender: () => { render(); onChange(); },
        remove: () => { removeField(draft, stepIndex, fieldIndex); render(); onChange(); },
        isOpen: (item) => open.has(item),
        toggle: (item) => { if (open.has(item)) open.delete(item); else open.add(item); render(); },
      });
      draggableRow(row, [stepIndex, fieldIndex]);
      list.appendChild(row);
    });
    if (step.fields.length === 0 && isMultiStep(draft)) {
      const empty = element('div', 'field-empty', 'No fields yet');
      dropTarget(empty, [stepIndex, 0]);
      list.appendChild(empty);
    }
    const add = element('label', 'add-field');
    add.append(icon('add', 14), element('span', '', 'Add field'));
    const picker = typeSelect('', (type) => {
      open.add(addField(draft, stepIndex, type));
      render();
      onChange();
      container.querySelector<HTMLInputElement>('.field-row.is-open:last-of-type .label-input')?.select();
    }, 'add-select');
    picker.prepend(Object.assign(element('option', '', 'Choose type'), { value: '', disabled: true }));
    picker.value = '';
    add.appendChild(picker);
    section.append(list, add);
    return section;
  }

  function render(): void {
    const head = element('div', 'form-head');
    head.append(
      labelled('Form title', textInput(draft.title, 'Sign up', 'input title-input', (value) => { draft.title = value; onChange(); })),
      labelled('Submit button', textInput(draft.submit.label, 'Submit', 'input', (value) => { draft.submit = { ...draft.submit, label: value }; onChange(); })),
    );
    const addStepButton = element('button', 'link add-link');
    addStepButton.type = 'button';
    addStepButton.append(icon('add', 14), document.createTextNode(isMultiStep(draft) ? 'Add step' : 'Split into steps'));
    addStepButton.onclick = () => { addStep(draft); render(); onChange(); };
    container.replaceChildren(head, ...steps(draft).map((_, index) => stepSection(index)), addStepButton);
  }

  return {
    get: () => draft,
    set(next) {
      draft = structuredClone(next);
      render();
    },
  };
}
