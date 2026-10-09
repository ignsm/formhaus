import { PLUGIN_NAMESPACE, readConfig, writeConfig, type KitId } from '../config';
import { resolveFonts } from '../fonts';
import { ROLES, type Role } from '../roles';
import type { Kit, KitTheme } from './kit';
import { materialKit } from './material';

const KITS: Record<KitId, Kit> = { material: materialKit, ios: materialKit };
const SECTION_GAP = 48;
const SECTION_PADDING = 40;

export interface LoadedKit {
  kit: Kit;
  theme: KitTheme;
  components: Map<Role, ComponentNode>;
}

export function kitById(id: KitId): Kit {
  return KITS[id];
}

export async function loadKit(id: KitId): Promise<LoadedKit> {
  const kit = kitById(id);
  const fonts = await resolveFonts(kit.fontFamilies);
  const config = readConfig();
  const known = config.kitNodes[id] ?? {};
  const components = new Map<Role, ComponentNode>();
  const missing: Role[] = [];
  for (const role of ROLES) {
    const node = known[role] ? await figma.getNodeByIdAsync(known[role]!) : null;
    if (node?.type === 'COMPONENT') components.set(role, node);
    else missing.push(role);
  }
  if (missing.length > 0) {
    const section = createSection(kit);
    for (const role of missing) {
      const node = kit.build(role, fonts);
      section.appendChild(node);
      components.set(role, node);
    }
    arrange(section, missing.map((role) => components.get(role)!));
    config.kitNodes[id] = Object.fromEntries([...components].map(([role, node]) => [role, node.id]));
    writeConfig(config);
  }
  return { kit, theme: kit.theme(fonts), components };
}

function createSection(kit: Kit): SectionNode {
  const section = figma.createSection();
  section.name = `Formhaus · ${kit.name}`;
  section.setSharedPluginData(PLUGIN_NAMESPACE, 'kit', kit.id);
  const page = figma.currentPage;
  const bottom = page.children.reduce((edge, node) => (
    node === section ? edge : Math.max(edge, node.y + ('height' in node ? node.height : 0))
  ), 0);
  section.x = 0;
  section.y = bottom + 200;
  return section;
}

function arrange(section: SectionNode, nodes: ComponentNode[]): void {
  let x = SECTION_PADDING;
  let rowHeight = 0;
  let y = SECTION_PADDING;
  const maxWidth = 1100;
  for (const node of nodes) {
    if (x + node.width > maxWidth && x > SECTION_PADDING) {
      x = SECTION_PADDING;
      y += rowHeight + SECTION_GAP;
      rowHeight = 0;
    }
    node.x = x;
    node.y = y;
    x += node.width + SECTION_GAP;
    rowHeight = Math.max(rowHeight, node.height);
  }
  section.resizeWithoutConstraints(maxWidth + SECTION_PADDING, y + rowHeight + SECTION_PADDING);
}
