import { PLUGIN_NAMESPACE } from '../config';
import { solid, stack, text } from '../kits/primitives';
import type { KitTheme } from '../kits/kit';
import type { FlowEdge } from './graph';
import type { Point } from './layout';

export const FLOW_KEY = 'flowOf';
const ANCHOR = 64;
const SPREAD = 28;
const END_LENGTH = 72;
const COLOR = '#8A8A8F';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function edgePoints(source: Box, target: Box | null, outIndex: number, inIndex: number): Point[] {
  const start = { x: source.x + source.width, y: source.y + ANCHOR + outIndex * SPREAD };
  if (!target) return [start, { x: start.x + END_LENGTH, y: start.y }];
  const end = { x: target.x, y: target.y + ANCHOR + inIndex * SPREAD };
  const middle = start.x + Math.max(24, (end.x - start.x) / 2);
  return [start, { x: middle, y: start.y }, { x: middle, y: end.y }, end];
}

async function arrow(points: Point[]): Promise<VectorNode> {
  const vector = figma.createVector();
  vector.name = 'Arrow';
  const origin = points[0];
  await vector.setVectorNetworkAsync({
    vertices: points.map((point, index) => ({
      x: point.x - origin.x,
      y: point.y - origin.y,
      strokeCap: index === points.length - 1 ? 'ARROW_LINES' : 'NONE',
    })),
    segments: points.slice(1).map((_, index) => ({ start: index, end: index + 1 })),
  });
  vector.strokes = solid(COLOR);
  vector.strokeWeight = 1.5;
  vector.x += origin.x;
  vector.y += origin.y;
  return vector;
}

function tag(content: string, theme: KitTheme, at: Point): FrameNode {
  const node = stack('HORIZONTAL', 'Condition', { paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4 });
  node.fills = solid('#FFFFFF');
  node.strokes = solid('#D9D9DE');
  node.cornerRadius = 6;
  node.appendChild(text(content, { font: theme.fonts.regular, size: 11, color: '#4A4A50' }, 'Label'));
  node.x = at.x;
  node.y = at.y;
  return node;
}

export async function drawFlow(definitionId: string, edges: FlowEdge[], boxes: Map<string, FrameNode>, theme: KitTheme): Promise<GroupNode | null> {
  const parent = [...boxes.values()][0]?.parent as (BaseNode & ChildrenMixin) | null;
  if (!parent) return null;
  const nodes: SceneNode[] = [];
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  for (const edge of edges) {
    const source = boxes.get(edge.from);
    const target = edge.to ? boxes.get(edge.to) ?? null : null;
    if (!source || (edge.to && !target) || (target && target.parent !== parent) || (!edge.to && !edge.label)) continue;
    const out = outgoing.get(edge.from) ?? 0;
    const into = edge.to ? incoming.get(edge.to) ?? 0 : 0;
    outgoing.set(edge.from, out + 1);
    if (edge.to) incoming.set(edge.to, into + 1);
    const points = edgePoints(source, target, out, into);
    nodes.push(await arrow(points));
    const label = edge.to ? edge.label : [edge.label, 'End'].filter(Boolean).join(' → ');
    if (label) nodes.push(tag(label, theme, { x: points[0].x + 12, y: points[0].y - 26 }));
  }
  if (nodes.length === 0) return null;
  for (const node of nodes) parent.appendChild(node);
  const group = figma.group(nodes, parent);
  group.name = 'Flow';
  group.setSharedPluginData(PLUGIN_NAMESPACE, FLOW_KEY, definitionId);
  return group;
}

export function removeFlow(definitionId: string): void {
  for (const node of figma.currentPage.findAllWithCriteria({ types: ['GROUP'], sharedPluginData: { namespace: PLUGIN_NAMESPACE, keys: [FLOW_KEY] } })) {
    if (node.getSharedPluginData(PLUGIN_NAMESPACE, FLOW_KEY) === definitionId) node.remove();
  }
}
