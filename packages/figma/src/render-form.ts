import type { FormField, FormSchema, FormStep } from '@formhaus/core';
import {
  getButtonKey,
  getFormsConstructorKey,
  CARD_GAP,
  CARD_INNER_WIDTH,
  CARD_PADDING,
  CARD_WIDTH,
} from './constants';
import { createButtonInstance } from './figma-helpers';
import { getSteps } from './parse';
import { renderField } from './render-field';

export async function renderForm(schema: FormSchema): Promise<FrameNode[]> {
  // Remove existing frames for this schema
  const existingFrames = figma.currentPage.children.filter(
    (n) => n.type === 'FRAME' && n.getSharedPluginData('formGenerator', 'schemaId') === schema.id,
  );
  for (const f of existingFrames) f.remove();

  const fcSet = await figma.importComponentSetByKeyAsync(getFormsConstructorKey());
  const btnSet = await figma.importComponentSetByKeyAsync(getButtonKey());

  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  const steps = getSteps(schema);
  const isMultiStep = steps.length > 1;

  let cursorX =
    figma.currentPage.children.reduce((max, n) => {
      const w = 'width' in n ? (n as FrameNode).width : 0;
      return Math.max(max, n.x + w);
    }, 0) + 100;

  const createdFrames: FrameNode[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const isFirst = i === 0;
    const isLast = i === steps.length - 1;

    const card = createCardFrame(
      isMultiStep ? `${schema.title} — Step ${i + 1}: ${step.title}` : schema.title,
      schema.id,
    );
    card.x = cursorX;
    card.y = 0;
    cursorX += CARD_WIDTH + CARD_GAP;

    // Step counter
    if (isMultiStep) {
      const counter = figma.createText();
      counter.fontName = { family: 'Inter', style: 'Regular' };
      counter.fontSize = 12;
      counter.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
      counter.characters = `Step ${i + 1} of ${steps.length}`;
      card.appendChild(counter);
      counter.layoutSizingHorizontal = 'FILL';
    }

    // Title
    const titleNode = figma.createText();
    titleNode.fontName = { family: 'Inter', style: 'Semi Bold' };
    titleNode.fontSize = 24;
    titleNode.characters = isMultiStep ? step.title : schema.title;
    card.appendChild(titleNode);
    titleNode.layoutSizingHorizontal = 'FILL';

    // Step description
    if ('description' in step && (step as FormStep).description) {
      const desc = figma.createText();
      desc.fontName = { family: 'Inter', style: 'Regular' };
      desc.fontSize = 14;
      desc.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
      desc.characters = (step as FormStep).description as string;
      card.appendChild(desc);
      desc.layoutSizingHorizontal = 'FILL';
    }

    // Fields
    for (const field of step.fields) {
      const fieldNode = await renderField(field, fcSet);
      if (fieldNode) {
        card.appendChild(fieldNode);
        if ('layoutSizingHorizontal' in fieldNode) {
          (fieldNode as SceneNode & { layoutSizingHorizontal: string }).layoutSizingHorizontal =
            'FILL';
        }
      }
    }

    // Action buttons, stacked vertically
    await appendButtons(card, btnSet, schema, isFirst, isLast, isMultiStep);

    createdFrames.push(card);
  }

  return createdFrames;
}

function createCardFrame(name: string, schemaId: string): FrameNode {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'FIXED';
  frame.resize(CARD_WIDTH, 100);
  frame.itemSpacing = 16;
  frame.paddingTop = CARD_PADDING;
  frame.paddingBottom = CARD_PADDING;
  frame.paddingLeft = CARD_PADDING;
  frame.paddingRight = CARD_PADDING;
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  frame.cornerRadius = 12;
  frame.setSharedPluginData('formGenerator', 'schemaId', schemaId);
  return frame;
}

async function appendButtons(
  card: FrameNode,
  btnSet: ComponentSetNode,
  schema: FormSchema,
  isFirst: boolean,
  isLast: boolean,
  isMultiStep: boolean,
): Promise<void> {
  const primaryLabel = isLast ? schema.submit.label : 'Continue';
  const primaryBtn = await createButtonInstance(btnSet, primaryLabel, 'Primary');
  if (primaryBtn) {
    primaryBtn.resize(CARD_INNER_WIDTH, primaryBtn.height);
    card.appendChild(primaryBtn);
  }

  if (isMultiStep && !isFirst) {
    const backBtn = await createButtonInstance(btnSet, 'Back', 'Secondary');
    if (backBtn) {
      backBtn.resize(CARD_INNER_WIDTH, backBtn.height);
      card.appendChild(backBtn);
    }
  }

  if (schema.cancel && isFirst) {
    const cancelBtn = await createButtonInstance(btnSet, schema.cancel.label, 'Secondary');
    if (cancelBtn) {
      cancelBtn.resize(CARD_INNER_WIDTH, cancelBtn.height);
      card.appendChild(cancelBtn);
    }
  }
}
