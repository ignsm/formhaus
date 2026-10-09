import type { FlowGraph } from './graph';

export interface Point {
  x: number;
  y: number;
}

const COLUMN_GAP = 200;
const ROW_GAP = 120;

export function flowPositions(order: string[], graph: FlowGraph, sizes: Map<string, { width: number; height: number }>, origin: Point): Map<string, Point> {
  const columns = new Map<number, string[]>();
  for (const id of order) {
    const depth = graph.depth.get(id) ?? 0;
    columns.set(depth, [...(columns.get(depth) ?? []), id]);
  }
  const positions = new Map<string, Point>();
  let x = origin.x;
  for (const depth of [...columns.keys()].sort((left, right) => left - right)) {
    const ids = columns.get(depth)!;
    let y = origin.y;
    for (const id of ids) {
      positions.set(id, { x, y });
      y += (sizes.get(id)?.height ?? 0) + ROW_GAP;
    }
    x += Math.max(...ids.map((id) => sizes.get(id)?.width ?? 0)) + COLUMN_GAP;
  }
  return positions;
}
