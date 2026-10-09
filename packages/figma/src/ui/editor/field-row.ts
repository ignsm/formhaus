import type { FormDefinition, FormField } from '@formhaus/core';
import { element, iconButton } from '../dom';
import { icon } from '../icons';
import { addOption, FIELD_TYPES, hasOptions, renameField, renameOption, setRequired, setType } from './model';

export interface RowContext {
  draft: FormDefinition;
  changed(): void;
  rerender(): void;
  remove(): void;
  isOpen(field: FormField): boolean;
  toggle(field: FormField): void;
}

const TYPE_LABELS: Record<string, string> = {
  text: 'Text', email: 'Email', phone: 'Phone', number: 'Number', password: 'Password', textarea: 'Text area',
  select: 'Select', autocomplete: 'Autocomplete', multiselect: 'Multi-select', radio: 'Radio', checkbox: 'Checkbox',
  switch: 'Switch', date: 'Date', datetime: 'Date & time', file: 'File',
};

export function typeSelect(value: string, onChange: (type: string) => void, className = 'type-select'): HTMLSelectElement {
  const select = element('select', className);
  const types = (FIELD_TYPES as readonly string[]).includes(value) ? FIELD_TYPES : [...FIELD_TYPES, value];
  for (const type of types) {
    const option = element('option', '', TYPE_LABELS[type] ?? type);
    option.value = type;
    select.appendChild(option);
  }
  select.value = value;
  select.onchange = () => onChange(select.value);
  return select;
}

function input(value: string, placeholder: string, onInput: (value: string) => void, className = 'input'): HTMLInputElement {
  const node = element('input', className);
  node.value = value;
  node.placeholder = placeholder;
  node.oninput = () => onInput(node.value);
  return node;
}

function detail(label: string, control: HTMLElement): HTMLElement {
  const node = element('label', 'detail');
  node.append(element('span', '', label), control);
  return node;
}

function options(field: FormField, context: RowContext): HTMLElement {
  const list = element('div', 'options');
  for (const [index, option] of (field.options ?? []).entries()) {
    const row = element('div', 'option-row');
    row.append(
      input(option.label, 'Option label', (value) => {
        renameOption(context.draft, field, option, value);
        context.changed();
      }),
      iconButton('close', 'Remove option', () => {
        field.options!.splice(index, 1);
        context.rerender();
      }),
    );
    list.appendChild(row);
  }
  const add = element('button', 'link add-link');
  add.type = 'button';
  add.append(icon('add', 14), document.createTextNode('Add option'));
  add.onclick = () => {
    addOption(field);
    context.rerender();
  };
  list.appendChild(add);
  return detail('Options', list);
}

function details(field: FormField, context: RowContext): HTMLElement {
  const node = element('div', 'field-details');
  const key = input(field.key, 'key', (value) => {
    field.key = value.trim();
    context.changed();
  }, 'input mono');
  node.append(
    detail('Placeholder', input(field.placeholder ?? '', 'Shown inside the empty field', (value) => {
      if (value) field.placeholder = value;
      else delete field.placeholder;
      context.changed();
    })),
    detail('Helper text', input(field.helperText ?? '', 'Shown under the field', (value) => {
      if (value) field.helperText = value;
      else delete field.helperText;
      context.changed();
    })),
    detail('Key', key),
  );
  if (hasOptions(field)) node.appendChild(options(field, context));
  return node;
}

export function fieldRow(field: FormField, context: RowContext): HTMLElement {
  const row = element('div', context.isOpen(field) ? 'field-row is-open' : 'field-row');
  const main = element('div', 'field-main');
  const handle = element('span', 'drag-handle');
  handle.title = 'Drag to reorder';
  handle.appendChild(icon('drag'));
  const label = input(field.label, 'Field label', (value) => {
    const before = field.key;
    renameField(context.draft, field, value);
    const keyInput = row.querySelector<HTMLInputElement>('.field-details .mono');
    if (keyInput && before !== field.key) keyInput.value = field.key;
    context.changed();
  }, 'input label-input');
  const required = element('button', field.validation?.required ? 'chip is-on' : 'chip', 'Required');
  required.type = 'button';
  required.setAttribute('aria-pressed', String(Boolean(field.validation?.required)));
  required.onclick = () => {
    setRequired(field, !field.validation?.required);
    context.rerender();
  };
  const more = iconButton('chevron', context.isOpen(field) ? 'Hide details' : 'Show details', () => context.toggle(field), 'icon-btn more-btn');
  main.append(
    handle,
    typeSelect(field.type, (type) => {
      setType(field, type);
      context.rerender();
    }),
    label,
    required,
    more,
    iconButton('delete', 'Delete field', context.remove),
  );
  row.appendChild(main);
  if (context.isOpen(field)) row.appendChild(details(field, context));
  return row;
}
