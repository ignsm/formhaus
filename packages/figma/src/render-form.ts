import type { FormAction, FormDefinition, FormField } from '@formhaus/core';
import { PLUGIN_NAMESPACE } from './config';
import type { KitTheme } from './kits/kit';
import { solid, stack, text } from './kits/primitives';
import { getSteps } from './parse';
import type { FormRenderer } from './renderers/types';

const LEGACY_NAMESPACE = 'formGenerator';
const FRAME_GAP = 40;
export const DEFINITION_KEY = 'definition';
const MAX_STORED_DEFINITION = 90_000;

interface RenderableStep {
  title: string;
  description?: string;
  fields: FormField[];
  next?: FormAction | false;
  back?: FormAction | false;
}

export async function renderForm(definition: FormDefinition, renderer: FormRenderer): Promise<FrameNode[]> {
  const existingFrames = findExistingFrames(definition.id).sort((left, right) => absolute(left, 0) - absolute(right, 0) || absolute(left, 1) - absolute(right, 1));
  const fallbackX = nextFrameX(figma.currentPage.children, existingFrames);
  const createdFrames: FrameNode[] = [];
  try {
    const steps = getSteps(definition) as RenderableStep[];
    const stored = JSON.stringify(definition);
    for (let index = 0; index < steps.length; index++) {
      const frame = await renderStep(definition, steps[index], index, steps.length, renderer);
      place(frame, existingFrames[index] ?? createdFrames[index - 1], Boolean(existingFrames[index]), fallbackX);
      if (utf8Length(stored) <= MAX_STORED_DEFINITION) frame.setSharedPluginData(PLUGIN_NAMESPACE, DEFINITION_KEY, stored);
      createdFrames.push(frame);
    }
    for (const frame of existingFrames) frame.remove();
    return createdFrames;
  } catch (error) {
    for (const frame of createdFrames) frame.remove();
    throw error;
  }
}

function absolute(frame: FrameNode, axis: 0 | 1): number {
  return frame.absoluteTransform[axis][2];
}

function utf8Length(text: string): number {
  return encodeURIComponent(text).replace(/%[0-9A-F]{2}/g, '_').length;
}

function place(frame: FrameNode, anchor: FrameNode | undefined, replaces: boolean, fallbackX: number): void {
  if (!anchor) {
    frame.x = fallbackX;
    frame.y = 0;
    return;
  }
  const parent = anchor.parent as (BaseNode & ChildrenMixin) | null;
  if (parent && parent !== frame.parent) parent.insertChild(parent.children.indexOf(anchor) + 1, frame);
  frame.x = replaces ? anchor.x : anchor.x + anchor.width + FRAME_GAP;
  frame.y = anchor.y;
}

function findExistingFrames(definitionId: string): FrameNode[] {
  return [...new Set([PLUGIN_NAMESPACE, LEGACY_NAMESPACE].flatMap((namespace) => figma.currentPage
    .findAllWithCriteria({ types: ['FRAME'], sharedPluginData: { namespace, keys: ['definitionId'] } })
    .filter((frame) => frame.getSharedPluginData(namespace, 'definitionId') === definitionId)))];
}

export function nextFrameX(
  children: readonly { x: number; width?: number }[],
  exclude: Iterable<{ x: number }>,
): number {
  const excluded = new Set(exclude);
  const rightEdge = children.reduce((maximum, node) => {
    if (excluded.has(node)) return maximum;
    const width = 'width' in node ? node.width ?? 0 : 0;
    return Math.max(maximum, node.x + width);
  }, 0);
  return rightEdge + 100;
}

async function renderStep(
  definition: FormDefinition,
  step: RenderableStep,
  index: number,
  stepCount: number,
  renderer: FormRenderer,
): Promise<FrameNode> {
  const isMultiStep = stepCount > 1;
  const name = isMultiStep ? `${definition.title} — Step ${index + 1}: ${step.title}` : definition.title;
  const frame = createCard(name, definition.id, renderer.theme);
  const { theme } = renderer;
  if (isMultiStep) append(frame, text(`Step ${index + 1} of ${stepCount}`, { font: theme.fonts.regular, size: theme.captionSize, color: theme.muted }, 'Progress'));
  append(frame, text(isMultiStep ? step.title : definition.title, { font: theme.fonts.semibold, size: theme.titleSize, color: theme.text }, 'Title'));
  if (step.description) append(frame, text(step.description, { font: theme.fonts.regular, size: theme.bodySize, color: theme.muted }, 'Description'));
  for (const field of step.fields) append(frame, await renderer.field(field));
  await appendButtons(frame, definition, step, renderer, { isFirst: index === 0, isLast: index === stepCount - 1, isMultiStep });
  return frame;
}

function append(frame: FrameNode, node: SceneNode | null): void {
  if (!node) return;
  frame.appendChild(node);
  if ('layoutSizingHorizontal' in node) node.layoutSizingHorizontal = 'FILL';
  if (node.type === 'TEXT') node.textAutoResize = 'HEIGHT';
}

function createCard(name: string, definitionId: string, theme: KitTheme): FrameNode {
  const frame = stack('VERTICAL', name, { itemSpacing: theme.card.gap });
  frame.paddingTop = theme.card.padding;
  frame.paddingBottom = theme.card.padding;
  frame.paddingLeft = theme.card.padding;
  frame.paddingRight = theme.card.padding;
  frame.resize(theme.card.width, frame.height);
  frame.counterAxisSizingMode = 'FIXED';
  frame.fills = solid(theme.card.fill);
  frame.cornerRadius = theme.card.radius;
  frame.setSharedPluginData(PLUGIN_NAMESPACE, 'definitionId', definitionId);
  return frame;
}

function actionLabel(action: FormAction | false | undefined, fallback: string): string | null {
  if (action === false) return null;
  return action?.label || fallback;
}

export function stepButtons(definition: FormDefinition, step: RenderableStep, isFirst: boolean, isLast: boolean, isMultiStep: boolean) {
  return {
    primary: isLast ? definition.submit.label : actionLabel(step.next, 'Continue'),
    back: isMultiStep && !isFirst ? actionLabel(step.back, 'Back') : null,
    cancel: definition.cancel?.label ?? null,
  };
}

async function appendButtons(
  frame: FrameNode,
  definition: FormDefinition,
  step: RenderableStep,
  renderer: FormRenderer,
  position: { isFirst: boolean; isLast: boolean; isMultiStep: boolean },
): Promise<void> {
  const labels = stepButtons(definition, step, position.isFirst, position.isLast, position.isMultiStep);
  if (!labels.primary && !labels.back && !labels.cancel) return;
  const actions = stack('VERTICAL', 'Actions', { itemSpacing: renderer.theme.actionsGap });
  append(frame, actions);
  if (labels.primary) append(actions, await renderer.button(labels.primary, true));
  if (labels.back) append(actions, await renderer.button(labels.back, false));
  if (labels.cancel) append(actions, await renderer.button(labels.cancel, false));
}
