import type { FormDefinition } from '@formhaus/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderForm } from '../render-form';

const definition: FormDefinition = {
  id: 'existing-form',
  title: 'Existing form',
  submit: { label: 'Submit' },
  fields: [{ key: 'name', type: 'text', label: 'Name' }],
};

describe('renderForm', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps existing frames when component imports fail', async () => {
    const remove = vi.fn();
    const existingFrame = {
      type: 'FRAME',
      getSharedPluginData: () => definition.id,
      remove,
    };
    vi.stubGlobal('figma', {
      currentPage: { children: [existingFrame] },
      importComponentSetByKeyAsync: vi.fn().mockRejectedValue(new Error('Import failed')),
      loadFontAsync: vi.fn().mockResolvedValue(undefined),
    });

    await expect(renderForm(definition)).rejects.toThrow('Import failed');

    expect(remove).not.toHaveBeenCalled();
  });
});
