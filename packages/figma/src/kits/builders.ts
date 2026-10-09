import type { KitFonts } from '../fonts';
import type { IconName } from '../icons';
import type { Role } from '../roles';
import { component, emptyAndFilled, type KitNode } from './primitives';

type Build = (root: ComponentNode) => void;
type ControlRole = 'field.checkbox' | 'field.switch' | 'option.radio' | 'option.checkbox';
type ButtonRole = 'button.primary' | 'button.secondary';

export interface KitParts {
  version: number;
  selectIcon: IconName;
  input(fonts: KitFonts, trailing: IconName | undefined, multiline: boolean, filled: boolean): Build;
  controls: Record<ControlRole, (fonts: KitFonts) => Build>;
  button(fonts: KitFonts, primary: boolean): Build;
}

const INPUTS: Partial<Record<Role, { trailing?: IconName | 'select'; multiline?: boolean }>> = {
  'field.text': {},
  'field.select': { trailing: 'select' },
  'field.date': { trailing: 'calendar' },
  'field.file': { trailing: 'upload' },
  'field.textarea': { multiline: true },
};

function isButton(role: Role): role is ButtonRole {
  return role === 'button.primary' || role === 'button.secondary';
}

export function buildRole(parts: KitParts, role: Role, fonts: KitFonts): KitNode {
  const input = INPUTS[role];
  if (input) {
    const trailing = input.trailing === 'select' ? parts.selectIcon : input.trailing;
    return emptyAndFilled(role, parts.version, (filled) => parts.input(fonts, trailing, Boolean(input.multiline), filled));
  }
  const build = isButton(role) ? parts.button(fonts, role === 'button.primary') : parts.controls[role as ControlRole](fonts);
  return component(role, role, parts.version, build);
}
