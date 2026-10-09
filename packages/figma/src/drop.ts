import type { PluginConfig } from './config';
import { createKitRenderer } from './renderers/kit-renderer';
import { ROLES, type Role } from './roles';

export function droppedRole(event: DropEvent): Role | undefined {
  const role = (event.dropMetadata as { role?: string } | undefined)?.role;
  return ROLES.find((candidate) => candidate === role);
}

export async function placeRole(event: DropEvent, role: Role, config: PluginConfig): Promise<InstanceNode> {
  const renderer = await createKitRenderer(config);
  const node = await renderer.sample(role);
  const target = event.node;
  if (target.type !== 'DOCUMENT' && 'appendChild' in target) target.appendChild(node);
  else figma.currentPage.appendChild(node);
  node.x = event.x;
  node.y = event.y;
  figma.currentPage.selection = [node];
  return node;
}
