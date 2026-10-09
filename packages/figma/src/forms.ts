import type { FormDefinition } from '@formhaus/core';
import { PLUGIN_NAMESPACE } from './config';
import { DEFINITION_KEY } from './render-form';

function formFrame(node: BaseNode | null): FrameNode | null {
  let current = node;
  while (current && current.parent && current.parent.type !== 'PAGE') current = current.parent;
  if (current?.type !== 'FRAME') return null;
  return current.getSharedPluginData(PLUGIN_NAMESPACE, 'definitionId') ? current : null;
}

export function selectedForm(selection: readonly SceneNode[]): FormDefinition | null {
  const frame = formFrame(selection[0] ?? null);
  const stored = frame?.getSharedPluginData(PLUGIN_NAMESPACE, DEFINITION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as FormDefinition;
  } catch {
    return null;
  }
}
