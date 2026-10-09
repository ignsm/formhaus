import type { Binding, TextSlot } from '../config';
import { slotForName } from '../text-slots';

export type SlotMap = Partial<Record<TextSlot, string>>;

export interface SlotInfo {
  candidates: string[];
  slots: SlotMap;
}

export function describeSlots(component: ComponentNode, binding?: Binding): SlotInfo {
  const owner = component.parent?.type === 'COMPONENT_SET' ? component.parent : component;
  const properties = Object.entries(owner.componentPropertyDefinitions)
    .filter(([, definition]) => definition.type === 'TEXT')
    .map(([key]) => key.split('#')[0]);
  const layers = component.findAllWithCriteria({ types: ['TEXT'] }).map((node) => node.name);
  const candidates = [...new Set([...properties, ...layers])];
  const slots: SlotMap = {};
  for (const name of candidates) {
    const slot = slotForName(name, binding);
    if (slot && !slots[slot]) slots[slot] = name;
  }
  return { candidates, slots };
}

export function assignSlot(current: SlotMap, slot: TextSlot, name: string): SlotMap {
  const next: SlotMap = {};
  for (const [key, value] of Object.entries(current) as [TextSlot, string][]) {
    if (key !== slot && value !== name) next[key] = value;
  }
  if (name) next[slot] = name;
  return next;
}
