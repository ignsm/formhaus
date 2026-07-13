import type { FormDefinition } from '@formhaus/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextFrameX, renderForm } from '../render-form';

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

describe('nextFrameX', () => {
  it('places the new form past unrelated content', () => {
    const children = [{ x: 0, width: 300 }, { x: 500, width: 200 }];
    expect(nextFrameX(children, [])).toBe(800);
  });

  it('ignores the frames about to be removed so position stays stable on regeneration', () => {
    const oldForm = { x: 0, width: 300 };
    const children = [oldForm];
    expect(nextFrameX(children, [oldForm])).toBe(100);
  });
});
