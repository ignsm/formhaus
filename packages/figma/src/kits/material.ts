import type { KitFonts } from '../fonts';
import type { IconName } from '../icons';
import type { Role } from '../roles';
import type { Kit } from './kit';
import { bindHelperVisibility, bindText, component, fill, fixed, icon, solid, stack, text } from './primitives';

const VERSION = 1;
const WIDTH = 320;

const C = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  surface: '#FEF7FF',
  onSurface: '#1D1B20',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
};

function helperRow(root: ComponentNode, fonts: KitFonts, indent: number): void {
  const row = stack('HORIZONTAL', 'Supporting', { paddingLeft: indent });
  const helper = text('Supporting text', { font: fonts.regular, size: 12, color: C.onSurfaceVariant }, 'Helper');
  row.appendChild(helper);
  root.appendChild(row);
  bindText(root, helper, 'helper');
  bindHelperVisibility(root, row);
}

function inputField(fonts: KitFonts, trailing?: IconName, height = 56) {
  return (root: ComponentNode) => {
    root.itemSpacing = 4;
    const container = stack('HORIZONTAL', 'Container', {
      paddingLeft: 16,
      paddingRight: trailing ? 12 : 16,
      itemSpacing: 12,
      counterAxisAlignItems: height > 56 ? 'MIN' : 'CENTER',
      paddingTop: height > 56 ? 8 : 0,
    });
    container.cornerRadius = 4;
    container.strokes = solid(C.outline);
    container.strokeWeight = 1;
    const column = stack('VERTICAL', 'Content');
    const label = text('Label', { font: fonts.regular, size: 12, color: C.onSurfaceVariant }, 'Label');
    const value = text('Placeholder', { font: fonts.regular, size: 16, color: C.onSurfaceVariant }, 'Value');
    column.appendChild(label);
    column.appendChild(value);
    container.appendChild(column);
    if (trailing) container.appendChild(icon(trailing, C.onSurfaceVariant, 24));
    root.appendChild(container);
    fixed(container, WIDTH, height);
    container.primaryAxisSizingMode = 'FIXED';
    fill(container);
    fill(column);
    bindText(root, label, 'label');
    bindText(root, value, 'value');
    helperRow(root, fonts, 16);
    root.resize(WIDTH, root.height);
    root.counterAxisSizingMode = 'FIXED';
  };
}

function checkboxGlyph(): FrameNode {
  const box = figma.createFrame();
  box.name = 'Checkbox';
  box.resize(18, 18);
  box.cornerRadius = 2;
  box.fills = [];
  box.strokes = solid(C.onSurfaceVariant);
  box.strokeWeight = 2;
  box.strokeAlign = 'INSIDE';
  return box;
}

function radioGlyph(): EllipseNode {
  const ring = figma.createEllipse();
  ring.name = 'Radio';
  ring.resize(20, 20);
  ring.fills = [];
  ring.strokes = solid(C.onSurfaceVariant);
  ring.strokeWeight = 2;
  ring.strokeAlign = 'INSIDE';
  return ring;
}

function switchGlyph(): FrameNode {
  const track = figma.createFrame();
  track.name = 'Switch';
  track.resize(52, 32);
  track.cornerRadius = 16;
  track.fills = solid('#E6E0E9');
  track.strokes = solid(C.outline);
  track.strokeWeight = 2;
  track.strokeAlign = 'INSIDE';
  const thumb = figma.createEllipse();
  thumb.name = 'Thumb';
  thumb.resize(16, 16);
  thumb.x = 8;
  thumb.y = 8;
  thumb.fills = solid(C.outline);
  track.appendChild(thumb);
  return track;
}

function control(fonts: KitFonts, glyph: () => SceneNode, trailing: boolean, withHelper: boolean) {
  return (root: ComponentNode) => {
    const row = stack('HORIZONTAL', 'Row', { itemSpacing: 12, counterAxisAlignItems: 'CENTER', paddingTop: 8, paddingBottom: 8 });
    const label = text('Label', { font: fonts.regular, size: 16, color: C.onSurface }, 'Label');
    if (!trailing) row.appendChild(glyph());
    row.appendChild(label);
    if (trailing) row.appendChild(glyph());
    root.appendChild(row);
    fixed(row, WIDTH);
    fill(label);
    bindText(root, label, 'label');
    if (withHelper) helperRow(root, fonts, trailing ? 0 : 30);
    root.resize(WIDTH, root.height);
    root.counterAxisSizingMode = 'FIXED';
  };
}

function button(fonts: KitFonts, primary: boolean) {
  return (root: ComponentNode) => {
    root.layoutMode = 'HORIZONTAL';
    root.primaryAxisAlignItems = 'CENTER';
    root.counterAxisAlignItems = 'CENTER';
    root.paddingLeft = 24;
    root.paddingRight = 24;
    root.cornerRadius = 20;
    root.fills = primary ? solid(C.primary) : [];
    if (!primary) {
      root.strokes = solid(C.outline);
      root.strokeWeight = 1;
    }
    const label = text('Button', { font: fonts.medium, size: 14, color: primary ? C.onPrimary : C.primary }, 'Label');
    root.appendChild(label);
    bindText(root, label, 'label');
    root.resize(WIDTH, 40);
    root.primaryAxisSizingMode = 'FIXED';
    root.counterAxisSizingMode = 'FIXED';
  };
}

const BUILDERS: Record<Role, (fonts: KitFonts) => (root: ComponentNode) => void> = {
  'field.text': (fonts) => inputField(fonts),
  'field.select': (fonts) => inputField(fonts, 'arrowDropDown'),
  'field.date': (fonts) => inputField(fonts, 'calendar'),
  'field.file': (fonts) => inputField(fonts, 'upload'),
  'field.textarea': (fonts) => inputField(fonts, undefined, 112),
  'field.checkbox': (fonts) => control(fonts, checkboxGlyph, false, true),
  'field.switch': (fonts) => control(fonts, switchGlyph, true, true),
  'option.radio': (fonts) => control(fonts, radioGlyph, false, false),
  'option.checkbox': (fonts) => control(fonts, checkboxGlyph, false, false),
  'button.primary': (fonts) => button(fonts, true),
  'button.secondary': (fonts) => button(fonts, false),
};

export const materialKit: Kit = {
  id: 'material',
  name: 'Material 3',
  version: VERSION,
  fontFamilies: ['Roboto'],
  theme: (fonts) => ({
    fonts,
    text: C.onSurface,
    muted: C.onSurfaceVariant,
    card: { fill: C.surface, radius: 28, padding: 24, gap: 16, width: 400 },
    optionGroup: { gap: 0 },
    titleSize: 24,
    bodySize: 16,
    captionSize: 12,
  }),
  build: (role, fonts) => component(role, role, VERSION, BUILDERS[role](fonts)),
};
