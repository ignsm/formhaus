import { describe, expect, it } from 'vitest';
import { matchRole } from '../bindings/auto-match';
import { componentFromSelection } from '../bindings/selection';
import { assignSlot, describeSlots } from '../bindings/slots';

const names = ['Icon button', 'Button / Secondary', 'Button / Primary', 'Text field', 'Text area', 'Date picker', 'Dropdown', 'Toggle', 'Checkbox', 'Radio'];

describe('matchRole', () => {
  it.each([
    ['field.text', 'Text field'],
    ['field.textarea', 'Text area'],
    ['field.date', 'Date picker'],
    ['field.select', 'Dropdown'],
    ['field.switch', 'Toggle'],
    ['field.checkbox', 'Checkbox'],
    ['option.radio', 'Radio'],
    ['button.primary', 'Button / Primary'],
    ['button.secondary', 'Button / Secondary'],
  ] as const)('matches %s to %s', (role, expected) => {
    expect(names[matchRole(role, names)]).toBe(expected);
  });

  it('returns -1 when nothing fits', () => {
    expect(matchRole('field.file', names)).toBe(-1);
  });
});

describe('assignSlot', () => {
  it('moves a layer name out of the slot it used to fill', () => {
    expect(assignSlot({ label: 'Title', value: 'Text' }, 'value', 'Title')).toEqual({ value: 'Title' });
  });

  it('clears a slot with an empty name', () => {
    expect(assignSlot({ label: 'Title', helper: 'Hint' }, 'helper', '')).toEqual({ label: 'Title' });
  });
});

function component(properties: string[], layers: string[], remote = false) {
  const node = {
    type: 'COMPONENT', id: '1:2', key: 'abc', name: 'Size=M', remote,
    parent: { type: 'COMPONENT_SET', name: 'Input', componentPropertyDefinitions: Object.fromEntries(properties.map((name, index) => [`${name}#${index}:0`, { type: 'TEXT' }])) },
    findAllWithCriteria: () => layers.map((name) => ({ name })),
  };
  return node as unknown as ComponentNode;
}

describe('describeSlots', () => {
  it('lists text properties and layers and detects slots', () => {
    expect(describeSlots(component(['Title'], ['Title', 'Placeholder', 'Hint']))).toEqual({
      candidates: ['Title', 'Placeholder', 'Hint'],
      slots: { label: 'Title', value: 'Placeholder', helper: 'Hint' },
    });
  });
});

describe('componentFromSelection', () => {
  it('binds a library instance by key with its variant and boolean properties', async () => {
    const main = component([], [], true);
    const instance = {
      type: 'INSTANCE',
      getMainComponentAsync: async () => main,
      componentProperties: { Size: { type: 'VARIANT', value: 'M' }, 'Icon#1:0': { type: 'BOOLEAN', value: false }, 'Title#2:0': { type: 'TEXT', value: 'x' } },
    };
    const { binding } = await componentFromSelection([instance as unknown as SceneNode]);
    expect(binding).toEqual({ source: 'library', key: 'abc', name: 'Input / Size=M', properties: { Size: 'M', 'Icon#1:0': false } });
  });

  it('binds a local component by id', async () => {
    const { binding } = await componentFromSelection([component([], []) as unknown as SceneNode]);
    expect(binding).toMatchObject({ source: 'local', id: '1:2' });
  });

  it('rejects anything that is not a component', async () => {
    await expect(componentFromSelection([{ type: 'FRAME' } as unknown as SceneNode])).rejects.toThrow('Select a component');
  });
});
