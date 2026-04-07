import type { FormField } from '@formhaus/core';

export async function setNestedText(
  instance: InstanceNode,
  layerName: string,
  text: string,
  fallbackStyle = 'Regular',
): Promise<void> {
  const allText = instance.findAll((n) => n.type === 'TEXT') as TextNode[];
  const match = allText.find((t) => t.name === layerName);
  if (!match) return;

  const originalFont = match.fontName as FontName;
  let fontLoaded = false;
  if (originalFont?.family) {
    try {
      await figma.loadFontAsync(originalFont);
      fontLoaded = true;
    } catch (_e) {}
  }
  if (!fontLoaded) {
    match.fontName = { family: 'Inter', style: fallbackStyle };
  }
  match.characters = text;
}

export function createPlaceholder(field: FormField): FrameNode {
  const frame = figma.createFrame();
  frame.name = `Missing: ${field.type}`;
  frame.resize(352, 48);
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 0.93, b: 0.93 } }];
  frame.strokes = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
  frame.strokeWeight = 1;
  frame.cornerRadius = 6;
  frame.layoutMode = 'HORIZONTAL';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.paddingLeft = 12;
  frame.paddingRight = 12;

  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Regular' };
  text.fontSize = 12;
  text.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0, b: 0 } }];
  text.characters = `Missing: ${field.type} "${field.label}"`;
  frame.appendChild(text);

  return frame;
}

export async function createButtonInstance(
  btnSet: ComponentSetNode,
  label: string,
  type: 'Primary' | 'Secondary',
): Promise<InstanceNode | null> {
  const variantName = `Type=${type},Left_Icon=False,Right_Icon=False,Color=Brand,State=Static`;
  const comp = btnSet.children.find((c) => c.name === variantName) as ComponentNode | undefined;
  if (!comp) return null;

  const instance = comp.createInstance();
  instance.name = label;

  await setNestedText(instance, 'Button Text', label, 'Semi Bold');
  return instance;
}
