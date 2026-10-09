import { PLUGIN_NAMESPACE, type Binding } from '../config';
import type { Role } from '../roles';
import { reference } from './selection';

interface Rule {
  match: RegExp;
  exclude?: RegExp;
  prefer?: RegExp;
}

const RULES: Record<Role, Rule> = {
  'field.textarea': { match: /text ?area|multi-?line/i },
  'field.select': { match: /select|dropdown|picker|combo/i, exclude: /date|time/i },
  'field.date': { match: /date/i },
  'field.file': { match: /file|upload/i },
  'field.text': { match: /text ?field|text ?input|input|textbox/i, exclude: /area|multi|select|date|file|check|radio|search/i },
  'field.checkbox': { match: /check ?box/i },
  'field.switch': { match: /switch|toggle/i },
  'option.radio': { match: /radio/i },
  'option.checkbox': { match: /check ?box/i },
  'button.primary': { match: /button|btn/i, exclude: /icon|radio|toggle|secondary|outline|ghost|tonal|text button/i, prefer: /primary|filled|main/i },
  'button.secondary': { match: /button|btn/i, exclude: /icon|radio|toggle|primary|filled/i, prefer: /secondary|outline|tonal|ghost/i },
};

export function matchRole(role: Role, names: string[]): number {
  const rule = RULES[role];
  const allowed = names
    .map((name, index) => ({ name, index }))
    .filter(({ name }) => rule.match.test(name) && !rule.exclude?.test(name));
  const preferred = rule.prefer ? allowed.find(({ name }) => rule.prefer!.test(name)) : undefined;
  return (preferred ?? allowed[0])?.index ?? -1;
}

export function autoMatch(page: PageNode, bound: Partial<Record<Role, Binding>>): Partial<Record<Role, Binding>> {
  const candidates = page.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })
    .filter((node) => node.parent?.type !== 'COMPONENT_SET' && !node.getSharedPluginData(PLUGIN_NAMESPACE, 'kitVersion'));
  const names = candidates.map((node) => node.name);
  const found: Partial<Record<Role, Binding>> = {};
  for (const role of Object.keys(RULES) as Role[]) {
    if (bound[role]) continue;
    const index = matchRole(role, names);
    if (index < 0) continue;
    const node = candidates[index];
    found[role] = reference(node.type === 'COMPONENT_SET' ? node.defaultVariant : node);
  }
  return found;
}
