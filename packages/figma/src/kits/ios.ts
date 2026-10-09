import type { KitFonts } from '../fonts';
import type { IconName } from '../icons';
import type { Role } from '../roles';
import type { Kit } from './kit';
import { bindHelperVisibility, bindText, component, fill, fixed, icon, solid, stack, text, variantSet, type KitNode } from './primitives';

const VERSION = 1;
const WIDTH = 330;
const CELL_RADIUS = 26;

const C = {
  blue: '#0088FF',
  label: '#000000',
  secondary: '#3C3C43',
  grouped: '#F2F2F7',
  cell: '#FFFFFF',
  gray: '#787880',
  separator: '#C6C6C8',
};

function fixedWidth(root: ComponentNode): void {
  root.resize(WIDTH, 44);
  root.counterAxisSizingMode = 'FIXED';
  root.primaryAxisSizingMode = 'AUTO';
}

function caption(root: ComponentNode, fonts: KitFonts, characters: string, name: string): { row: FrameNode; node: TextNode } {
  const row = stack('HORIZONTAL', name, { paddingLeft: 16, paddingRight: 16 });
  const node = text(characters, { font: fonts.regular, size: 13, color: C.secondary, opacity: 0.6 }, name === 'Header' ? 'Label' : 'Helper');
  row.appendChild(node);
  root.appendChild(row);
  fill(row);
  fill(node);
  node.textAutoResize = 'HEIGHT';
  return { row, node };
}

function cell(name: string): FrameNode {
  const frame = stack('HORIZONTAL', name, { paddingLeft: 16, paddingRight: 16, itemSpacing: 12, counterAxisAlignItems: 'CENTER' });
  frame.fills = solid(C.cell);
  frame.cornerRadius = CELL_RADIUS;
  return frame;
}

function inputCell(fonts: KitFonts, trailing: IconName | undefined, multiline: boolean, filled: boolean) {
  return (root: ComponentNode) => {
    fixedWidth(root);
    root.itemSpacing = 6;
    const header = caption(root, fonts, 'Label', 'Header');
    const container = cell('Container');
    if (multiline) {
      container.counterAxisAlignItems = 'MIN';
      container.paddingTop = 14;
    }
    const value = filled
      ? text('Value', { font: fonts.regular, size: 17, color: C.label }, 'Value')
      : text('Placeholder', { font: fonts.regular, size: 17, color: C.secondary, opacity: 0.3 }, 'Value');
    container.appendChild(value);
    if (trailing) container.appendChild(icon(trailing, trailing === 'unfoldMore' ? C.gray : C.blue, 22));
    root.appendChild(container);
    fixed(container, WIDTH, multiline ? 120 : 52);
    container.primaryAxisSizingMode = 'FIXED';
    fill(container);
    fill(value);
    const footer = caption(root, fonts, 'Supporting text', 'Footer');
    bindText(root, header.node, 'label');
    bindText(root, value, 'value');
    bindText(root, footer.node, 'helper');
    bindHelperVisibility(root, footer.row);
  };
}

function inputField(role: Role, fonts: KitFonts, trailing?: IconName, multiline = false): KitNode {
  return variantSet(role, VERSION, {
    Empty: inputCell(fonts, trailing, multiline, false),
    Filled: inputCell(fonts, trailing, multiline, true),
  });
}

function circle(): EllipseNode {
  const ring = figma.createEllipse();
  ring.name = 'Checkbox';
  ring.resize(22, 22);
  ring.fills = [];
  ring.strokes = solid(C.secondary, 0.3);
  ring.strokeWeight = 1.5;
  ring.strokeAlign = 'INSIDE';
  return ring;
}

function toggle(): FrameNode {
  const track = figma.createFrame();
  track.name = 'Switch';
  track.resize(64, 28);
  track.cornerRadius = 14;
  track.fills = solid(C.gray, 0.16);
  const thumb = figma.createFrame();
  thumb.name = 'Thumb';
  thumb.resize(38, 24);
  thumb.x = 2;
  thumb.y = 2;
  thumb.cornerRadius = 12;
  thumb.fills = solid(C.cell);
  thumb.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.12 }, offset: { x: 0, y: 2 }, radius: 6, spread: 0, visible: true, blendMode: 'NORMAL' }];
  track.appendChild(thumb);
  return track;
}

function controlCell(fonts: KitFonts, trailing: (() => SceneNode) | null, standalone: boolean) {
  return (root: ComponentNode) => {
    fixedWidth(root);
    root.itemSpacing = 6;
    const row = standalone ? cell('Container') : stack('HORIZONTAL', 'Row', { paddingLeft: 16, paddingRight: 16, itemSpacing: 12, counterAxisAlignItems: 'CENTER' });
    const label = text('Label', { font: fonts.regular, size: 17, color: C.label }, 'Label');
    row.appendChild(label);
    if (trailing) row.appendChild(trailing());
    root.appendChild(row);
    fixed(row, WIDTH, 52);
    fill(row);
    fill(label);
    bindText(root, label, 'label');
    if (standalone) {
      const footer = caption(root, fonts, 'Supporting text', 'Footer');
      bindText(root, footer.node, 'helper');
      bindHelperVisibility(root, footer.row);
      return;
    }
    const separator = stack('HORIZONTAL', 'Separator', { paddingLeft: 16 });
    const line = figma.createRectangle();
    line.name = 'Line';
    line.resize(WIDTH - 16, 0.5);
    line.fills = solid(C.separator);
    separator.appendChild(line);
    root.appendChild(separator);
    fill(separator);
    line.layoutSizingHorizontal = 'FILL';
  };
}

function button(fonts: KitFonts, primary: boolean) {
  return (root: ComponentNode) => {
    root.layoutMode = 'HORIZONTAL';
    root.primaryAxisAlignItems = 'CENTER';
    root.counterAxisAlignItems = 'CENTER';
    root.cornerRadius = 26;
    root.fills = primary ? solid(C.blue) : solid(C.gray, 0.16);
    const label = text('Button', { font: fonts.semibold, size: 17, color: primary ? C.cell : C.blue }, 'Label');
    root.appendChild(label);
    bindText(root, label, 'label');
    root.resize(WIDTH, 52);
    root.primaryAxisSizingMode = 'FIXED';
    root.counterAxisSizingMode = 'FIXED';
  };
}

const BUILDERS: Record<Role, (role: Role, fonts: KitFonts) => KitNode> = {
  'field.text': (role, fonts) => inputField(role, fonts),
  'field.select': (role, fonts) => inputField(role, fonts, 'unfoldMore'),
  'field.date': (role, fonts) => inputField(role, fonts, 'calendar'),
  'field.file': (role, fonts) => inputField(role, fonts, 'upload'),
  'field.textarea': (role, fonts) => inputField(role, fonts, undefined, true),
  'field.checkbox': (role, fonts) => component(role, role, VERSION, controlCell(fonts, circle, true)),
  'field.switch': (role, fonts) => component(role, role, VERSION, controlCell(fonts, toggle, true)),
  'option.radio': (role, fonts) => component(role, role, VERSION, controlCell(fonts, null, false)),
  'option.checkbox': (role, fonts) => component(role, role, VERSION, controlCell(fonts, circle, false)),
  'button.primary': (role, fonts) => component(role, role, VERSION, button(fonts, true)),
  'button.secondary': (role, fonts) => component(role, role, VERSION, button(fonts, false)),
};

export const iosKit: Kit = {
  id: 'ios',
  name: 'iOS-like',
  version: VERSION,
  fontFamilies: ['SF Pro', 'SF Pro Text'],
  theme: (fonts) => ({
    fonts,
    text: C.label,
    muted: '#8A8A8E',
    card: { fill: C.grouped, radius: 34, padding: 20, gap: 20, width: 370 },
    actionsGap: 12,
    optionGroup: { gap: 0, fill: C.cell, radius: CELL_RADIUS },
    titleSize: 28,
    bodySize: 17,
    captionSize: 13,
  }),
  build: (role, fonts) => BUILDERS[role](role, fonts),
};
