import { PLUGIN_NAMESPACE, type TextSlot } from '../config';
import { iconSvg, type IconName } from '../icons';
import type { Role } from '../roles';

export const SLOT_PROPERTY: Record<TextSlot, string> = { label: 'Label', value: 'Value', helper: 'Helper' };
export const HELPER_VISIBLE_PROPERTY = 'Show helper';

export function hex(value: string): RGB {
  return {
    r: parseInt(value.slice(1, 3), 16) / 255,
    g: parseInt(value.slice(3, 5), 16) / 255,
    b: parseInt(value.slice(5, 7), 16) / 255,
  };
}

export function solid(value: string, opacity?: number): SolidPaint[] {
  return [{ type: 'SOLID', color: hex(value), ...(opacity === undefined ? {} : { opacity }) }];
}

export interface TextStyle {
  font: FontName;
  size: number;
  color: string;
  opacity?: number;
}

export function text(characters: string, style: TextStyle, name: string): TextNode {
  const node = figma.createText();
  node.name = name;
  node.fontName = style.font;
  node.fontSize = style.size;
  node.characters = characters;
  node.fills = solid(style.color, style.opacity);
  return node;
}

type StackProps = Partial<Pick<FrameNode,
  'itemSpacing' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom' |
  'primaryAxisAlignItems' | 'counterAxisAlignItems'>>;

export function stack(direction: 'HORIZONTAL' | 'VERTICAL', name: string, props: StackProps = {}): FrameNode {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = direction;
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.fills = [];
  Object.assign(frame, props);
  return frame;
}

export function fixed(frame: FrameNode, width: number, height?: number): FrameNode {
  frame.resize(width, height ?? frame.height);
  frame.counterAxisSizingMode = 'FIXED';
  if (height !== undefined) frame.primaryAxisSizingMode = frame.layoutMode === 'VERTICAL' ? 'FIXED' : frame.primaryAxisSizingMode;
  return frame;
}

export function fill(child: SceneNode & LayoutMixin): void {
  child.layoutSizingHorizontal = 'FILL';
}

export function icon(name: IconName, color: string, size: number): FrameNode {
  const node = figma.createNodeFromSvg(iconSvg(name, color, size));
  node.name = `Icon/${name}`;
  return node;
}

export function component(role: Role, name: string, version: number, build: (root: ComponentNode) => void): ComponentNode {
  const root = figma.createComponent();
  root.name = name;
  root.layoutMode = 'VERTICAL';
  root.primaryAxisSizingMode = 'AUTO';
  root.counterAxisSizingMode = 'AUTO';
  root.fills = [];
  build(root);
  root.setSharedPluginData(PLUGIN_NAMESPACE, 'role', role);
  root.setSharedPluginData(PLUGIN_NAMESPACE, 'kitVersion', String(version));
  return root;
}

export const STATE_PROPERTY = 'State';

export type KitNode = ComponentNode | ComponentSetNode;

export function variantSet(role: Role, version: number, builds: Record<string, (root: ComponentNode) => void>): ComponentSetNode {
  const variants = Object.entries(builds).map(([state, build]) => component(role, `${STATE_PROPERTY}=${state}`, version, build));
  const set = figma.combineAsVariants(variants, figma.currentPage);
  set.name = role;
  set.layoutMode = 'HORIZONTAL';
  set.primaryAxisSizingMode = 'AUTO';
  set.counterAxisSizingMode = 'AUTO';
  set.itemSpacing = 24;
  set.fills = [];
  set.setSharedPluginData(PLUGIN_NAMESPACE, 'role', role);
  set.setSharedPluginData(PLUGIN_NAMESPACE, 'kitVersion', String(version));
  return set;
}

export function bindText(root: ComponentNode, node: TextNode, slot: TextSlot): void {
  const key = root.addComponentProperty(SLOT_PROPERTY[slot], 'TEXT', node.characters);
  node.componentPropertyReferences = { characters: key };
}

export function bindHelperVisibility(root: ComponentNode, node: SceneNode): void {
  const key = root.addComponentProperty(HELPER_VISIBLE_PROPERTY, 'BOOLEAN', true);
  node.componentPropertyReferences = { visible: key };
}
